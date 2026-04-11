import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    ActivityIndicator, TouchableOpacity, TextInput
} from 'react-native';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import { boardService } from '../../services/boardService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { uiStatusToApi } from '../../utils/taskStatus';
import { useFocusEffect } from '@react-navigation/native';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const BoardDetailScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { boardId, boardName } = route.params;
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Quick Add Stateleri
    const [quickAddCol, setQuickAddCol] = useState(null);
    const [quickAddTitle, setQuickAddTitle] = useState('');
    const [quickAdding, setQuickAdding] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadBoardData();
        }, [boardId])
    );

    const loadBoardData = async () => {
        setError(null);
        setLoading(true);
        try {
            const [boardData, taskData] = await Promise.all([
                boardService.getBoard(boardId),
                taskService.getTasks(boardId),
            ]);
            setBoard(boardData);
            setTasks(taskData);
        } catch (err) {
            console.error('Board detail error:', err);
            const msg = err.response?.data?.message || err.message || 'Pano veya görevler yüklenemedi.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAddSubmit = async (col) => {
        if (!quickAddTitle.trim() || !user?.id) return;
        setQuickAdding(true);
        try {
            const payload = {
                title: quickAddTitle.trim(),
                boardId: boardId,
                status: uiStatusToApi(col),
                priority: 'MEDIUM',
            };
            await taskService.createTask(payload, user.id);
            setQuickAddTitle('');
            loadBoardData(); // Listeyi yenile
        } catch (err) {
            console.error('Quick Add error:', err);
        } finally {
            setQuickAdding(false);
        }
    };

    const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

    return (
        <SafeAreaView style={styles.container}>
            {/* Board Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.boardName}>{boardName}</Text>
                    <Text style={styles.boardDesc}>{board?.description}</Text>
                </View>
                <TouchableOpacity
                    style={styles.addTaskBtn}
                    onPress={() => navigation.navigate('AddTask', { boardId })}>
                    <Text style={styles.addTaskText}>+ Görev</Text>
                </TouchableOpacity>
            </View>

            {/* İstatistik */}
            <View style={styles.stats}>
                <Text style={styles.statText}>{tasks.length} görev toplam</Text>
                <Text style={styles.statText}>{getTasksByStatus('Done').length} tamamlandı</Text>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={loadBoardData}>
                        <Text style={styles.retryText}>Tekrar dene</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.board}>
                    {COLUMNS.map((col) => (
                        <View key={col} style={styles.column}>
                            <View style={styles.columnHeader}>
                                <View style={[styles.dot, { backgroundColor: STATUS_COLORS[col] }]} />
                                <Text style={styles.columnTitle}>{col}</Text>
                                <Text style={styles.columnCount}>{getTasksByStatus(col).length}</Text>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {getTasksByStatus(col).map((task) => (
                                    <TouchableOpacity
                                        key={task.id}
                                        style={styles.taskCard}
                                        onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}>
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
        alignItems: 'flex-start',
        padding: 20,
        paddingBottom: 12,
    },
    boardName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
    boardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
    addTaskBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addTaskText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
    stats: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginBottom: 12,
    },
    statText: { color: COLORS.textSecondary, fontSize: 13 },
    board: { flex: 1, paddingLeft: 16 },
    column: {
        width: 240,
        marginRight: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 12,
    },
    columnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    columnTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
    columnCount: {
        backgroundColor: COLORS.surfaceLight,
        color: COLORS.textSecondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
    },
    taskCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    taskTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
    taskDesc: { fontSize: 12, color: '#6B7280' },
    addColTaskBtn: { alignItems: 'center', paddingVertical: 10 },
    addColTaskText: { color: COLORS.primary, fontSize: 13 },
    errorBanner: {
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#EF444420',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    errorText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
    retryText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    
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

export default BoardDetailScreen;
