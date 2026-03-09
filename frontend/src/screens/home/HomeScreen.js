import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import { boardService } from '../../services/boardService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            // TODO: Kullanıcının tüm panolarındaki görevleri yükle
            setLoading(false);
        } catch (error) {
            console.error('Tasks load error:', error);
            setLoading(false);
        }
    };

    const getTasksByStatus = (status) =>
        tasks.filter((t) => t.status === status);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Merhaba, {user?.name?.split(' ')[0]} 👋</Text>
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

            {loading ? (
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
                                    onPress={() => navigation.navigate('AddTask')}>
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
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                                    </TouchableOpacity>
                                ))}
                                {getTasksByStatus(col).length === 0 && (
                                    <View style={styles.emptyCol}>
                                        <Text style={styles.emptyText}>Görev yok</Text>
                                    </View>
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
});

export default HomeScreen;
