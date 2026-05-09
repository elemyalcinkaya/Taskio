import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    ActivityIndicator, TouchableOpacity, TextInput,
} from 'react-native';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import { boardService } from '../../services/boardService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { uiStatusToApi } from '../../utils/taskStatus';
import { useFocusEffect } from '@react-navigation/native';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [error, setError] = useState(null);

    // Quick Add Stateleri
    const [quickAddCol, setQuickAddCol] = useState(null);
    const [quickAddTitle, setQuickAddTitle] = useState('');
    const [quickAdding, setQuickAdding] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [user?.id])
    );

    const loadTasks = async () => {
        if (!user?.id) {
            setTasks([]);
            setBoards([]);
            setLoading(false);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const fetchedBoards = await boardService.getBoards(user.id);
            setBoards(fetchedBoards);
            const merged = [];
            for (const b of fetchedBoards) {
                const boardTasks = await taskService.getTasks(b.id);
                merged.push(
                    ...boardTasks.map((t) => ({
                        ...t,
                        boardName: b.name,
                    })),
                );
            }

            // Sadece bana ait görevleri göster:
            // - Atanan kişi yoksa (assignees boş) → oluşturan bensem bana ait
            // - Atanan kişi varsa → ben atananlar arasındaysam bana ait
            const myTasks = merged.filter((t) => {
                if (!t.assignees || t.assignees.length === 0) {
                    // Atanmamış görev: yaratıcısı bensem bana ait
                    return t.creator?.id === user.id;
                }
                // Atananlar arasında ben varım mı?
                return t.assignees.some((a) => a.id === user.id);
            });

            setTasks(myTasks);
        } catch (err) {
            console.error('Tasks load error:', err);
            const msg = err.response?.data?.message || err.message || 'Görevler yüklenemedi.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAddSubmit = async (col) => {
        if (!quickAddTitle.trim() || !user?.id) return;
        setQuickAdding(true);
        try {
            // Inbox Pano Bul Veya Oluştur
            let inboxBoard = boards.find(b => b.name.toLowerCase() === 'inbox' || b.name.toLowerCase() === 'kişisel');
            if (!inboxBoard) {
                inboxBoard = await boardService.createBoard(
                    { name: 'Inbox', description: 'Kişisel görevlerim', color: '#8B5CF6' },
                    user.id
                );
                setBoards(prev => [...prev, inboxBoard]);
            }
            
            // Task Oluştur
            const payload = {
                title: quickAddTitle.trim(),
                boardId: inboxBoard.id,
                status: uiStatusToApi(col), // UI to API çevirimi düzeltildi
                priority: 'MEDIUM',
            };
            await taskService.createTask(payload, user.id);
            
            // UI Güncelle
            setQuickAddTitle(''); // Formu sil (kapanmasına gerek yok ard arda yazabilir)
            loadTasks(); // Listeyi yenile
        } catch (error) {
            console.error('Quick Add error:', error);
        } finally {
            setQuickAdding(false);
        }
    };

    const visibleTasks =
        activeFilter === 'All' ? tasks : tasks.filter((t) => t.status === activeFilter);

    const getTasksByStatus = (status) => visibleTasks.filter((t) => t.status === status);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Merhaba, {user?.name?.split(' ')[0]}</Text>
                    <Text style={styles.subtitle}>Bugünkü görevlerin</Text>
                </View>
            </View>

            {/* Filtreler */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                {['All', ...COLUMNS].map((col) => (
                    <TouchableOpacity
                        key={col}
                        style={[styles.filterChip, activeFilter === col && styles.filterChipActive]}
                        onPress={() => setActiveFilter(col)}>
                        <Text style={[styles.filterText, activeFilter === col && styles.filterTextActive]}>
                            {col}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity onPress={loadTasks}>
                        <Text style={styles.retryText}>Tekrar dene</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading && tasks.length === 0 ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                /* Kanban Board - Yatay scroll */
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.board}>
                    {COLUMNS.map((col) => (
                        <View key={col} style={styles.column}>
                            {/* Kolon başlığı */}
                            <View style={styles.columnHeader}>
                                <View style={[styles.dot, { backgroundColor: STATUS_COLORS[col] }]} />
                                <Text style={styles.columnTitle}>{col}</Text>
                                <Text style={styles.columnCount}>{getTasksByStatus(col).length}</Text>
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => navigation.navigate('AddTask', { defaultStatus: col })}>
                                    <Text style={styles.addBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Görev kartları */}
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {getTasksByStatus(col).map((task) => (
                                    <TouchableOpacity
                                        key={task.id}
                                        style={styles.taskCard}
                                        onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}>
                                        
                                        {/* Board Etiketi */}
                                        {task.boardName && (
                                            <View style={styles.boardBadge}>
                                                <Text style={styles.boardBadgeText} numberOfLines={1}>
                                                    {task.boardName}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        {task.description ? <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text> : null}
                                    </TouchableOpacity>
                                ))}

                                {/* Quick Add Bölümü */}
                                {quickAddCol === col ? (
                                    <View style={styles.quickAddContainer}>
                                        <TextInput
                                            style={styles.quickAddInput}
                                            placeholder="Ne yapılmalı?"
                                            placeholderTextColor={COLORS.textMuted}
                                            value={quickAddTitle}
                                            onChangeText={setQuickAddTitle}
                                            onSubmitEditing={() => handleQuickAddSubmit(col)}
                                            autoFocus
                                        />
                                        <View style={styles.quickActions}>
                                            <TouchableOpacity onPress={() => { setQuickAddCol(null); setQuickAddTitle(''); }}>
                                                <Text style={styles.quickCancelBtn}>İptal</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleQuickAddSubmit(col)} disabled={quickAdding}>
                                                {quickAdding ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.quickSubmitBtn}>Ekle</Text>}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.quickAddTrigger} onPress={() => setQuickAddCol(col)}>
                                        <Text style={styles.quickAddTriggerText}>+ Yeni Kart Ekle</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
    },
    greeting: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
    subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    filterBar: { paddingHorizontal: 16, paddingVertical: 8, flexGrow: 0 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
    filterTextActive: { color: COLORS.white },
    loader: { flex: 1 },
    board: { flex: 1, paddingLeft: 16 },
    column: {
        width: 240,
        marginRight: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 12,
        maxHeight: '100%',
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    columnTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
    columnCount: {
        backgroundColor: COLORS.surfaceLight,
        color: COLORS.textSecondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
        marginRight: 8,
    },
    addBtn: { padding: 4 },
    addBtnText: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold' },
    taskCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    taskTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
    taskDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
    emptyCol: { alignItems: 'center', paddingVertical: 20 },
    emptyText: { color: COLORS.textMuted, fontSize: 13 },
    errorBanner: {
        marginHorizontal: 20,
        marginBottom: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#EF444420',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    errorBannerText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
    retryText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    boardBadge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primaryLight + '20', // %20 opacity
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 6,
    },
    boardBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryLight },
    
    // Quick Add Stilleri
    quickAddContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    quickAddInput: {
        color: '#1a1a2e',
        fontSize: 14,
        fontWeight: '500',
        padding: 0,
        marginBottom: 10,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    quickCancelBtn: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 16,
    },
    quickSubmitBtn: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    quickAddTrigger: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    quickAddTriggerText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
});

export default HomeScreen;
