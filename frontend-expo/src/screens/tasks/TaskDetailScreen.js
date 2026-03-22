import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../../constants/colors';
import { taskService } from '../../services/taskService';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

const TaskDetailScreen = ({ route, navigation }) => {
    const { taskId } = route.params;
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTask();
    }, [taskId]);

    const loadTask = async () => {
        try {
            const data = await taskService.getTask(taskId);
            setTask(data);
        } catch (error) {
            console.error('Task detail error:', error);
            Alert.alert('Hata', 'Görev yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await taskService.updateStatus(taskId, newStatus);
            setTask((prev) => ({ ...prev, status: newStatus }));
        } catch (error) {
            Alert.alert('Hata', 'Durum güncellenemedi.');
        }
    };

    const handleDelete = async () => {
        Alert.alert('Görevi Sil', 'Bu görevi silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Sil',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await taskService.deleteTask(taskId);
                        navigation.goBack();
                    } catch (error) {
                        Alert.alert('Hata', 'Görev silinemedi.');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    if (!task) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Görev bulunamadı.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Başlık & öncelik */}
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{task.title}</Text>
                    {task.priority && (
                        <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] }]}>
                            <Text style={styles.priorityText}>{task.priority}</Text>
                        </View>
                    )}
                </View>

                {/* Açıklama */}
                {task.description && (
                    <Text style={styles.description}>{task.description}</Text>
                )}

                {/* Durum Seçici */}
                <Text style={styles.sectionTitle}>Durum</Text>
                <View style={styles.statusRow}>
                    {STATUSES.map((s) => (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.statusChip,
                                { borderColor: STATUS_COLORS[s] },
                                task.status === s && { backgroundColor: STATUS_COLORS[s] },
                            ]}
                            onPress={() => handleStatusChange(s)}>
                            <Text style={[
                                styles.statusText,
                                { color: task.status === s ? COLORS.white : STATUS_COLORS[s] },
                            ]}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Atananlar */}
                {task.assignees?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Atananlar</Text>
                        <View style={styles.assigneesRow}>
                            {task.assignees.map((a) => (
                                <View key={a.id} style={styles.assignee}>
                                    <Text style={styles.assigneeText}>{a.name?.charAt(0).toUpperCase()}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Etiketler */}
                {task.labels?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Etiketler</Text>
                        <View style={styles.labelsRow}>
                            {task.labels.map((l) => (
                                <View key={l.id} style={styles.labelChip}>
                                    <Text style={styles.labelText}>{l.name}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Sil */}
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Görevi Sil</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, flex: 1 },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    priorityText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
    description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 10, marginTop: 20 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    statusText: { fontSize: 13, fontWeight: '600' },
    assigneesRow: { flexDirection: 'row', gap: 8 },
    assignee: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assigneeText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
    labelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    labelChip: {
        backgroundColor: COLORS.surfaceLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    labelText: { color: COLORS.textSecondary, fontSize: 13 },
    deleteBtn: {
        marginTop: 40,
        backgroundColor: '#EF444420',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
    errorText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default TaskDetailScreen;
