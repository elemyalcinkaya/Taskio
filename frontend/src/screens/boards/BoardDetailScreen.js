import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import { boardService } from '../../services/boardService';
import { taskService } from '../../services/taskService';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const BoardDetailScreen = ({ route, navigation }) => {
    const { boardId, boardName } = route.params;
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBoardData();
    }, [boardId]);

    const loadBoardData = async () => {
        try {
            const [boardData, taskData] = await Promise.all([
                boardService.getBoard(boardId),
                taskService.getTasks(boardId),
            ]);
            setBoard(boardData);
            setTasks(taskData);
        } catch (error) {
            console.error('Board detail error:', error);
        } finally {
            setLoading(false);
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
                            <ScrollView>
                                {getTasksByStatus(col).map((task) => (
                                    <TouchableOpacity
                                        key={task.id}
                                        style={styles.taskCard}
                                        onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}>
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.addColTaskBtn}
                                    onPress={() => navigation.navigate('AddTask', { boardId, defaultStatus: col })}>
                                    <Text style={styles.addColTaskText}>+ Görev ekle</Text>
                                </TouchableOpacity>
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
});

export default BoardDetailScreen;
