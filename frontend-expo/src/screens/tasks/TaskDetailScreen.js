import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    ActivityIndicator, TouchableOpacity, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../../constants/colors';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

const TaskDetailScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { taskId } = route.params;
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadTask();
        }, [taskId])
    );

    React.useLayoutEffect(() => {
        if (task) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={() => navigation.push('AddTask', { task })}>
                        <Feather name="edit-2" size={20} color={COLORS.primary} style={{ marginRight: 15 }} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, task]);

    const loadTask = async () => {
        try {
            const data = await taskService.getTask(taskId);
            setTask(data);
        } catch (error) {
            console.error('Task detail error:', error);
        } finally {
            setLoading(false);
        }
    };

    const performDelete = async () => {
        if (!user?.id) return;
        setShowDeleteModal(false);
        setDeleting(true);
        try {
            await taskService.deleteTask(taskId, user.id);
            if (navigation.canGoBack()) {
                navigation.goBack();
            }
        } catch (error) {
            console.error('Delete error:', JSON.stringify(error?.response?.data));
        } finally {
            setDeleting(false);
        }
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

                {/* Durum Göstergesi */}
                <Text style={styles.sectionTitle}>DURUM</Text>
                <View style={styles.statusRow}>
                    {STATUSES.map((s) => (
                        <View
                            key={s}
                            style={[
                                styles.statusChip,
                                { borderColor: STATUS_COLORS[s] },
                                task.status === s && { backgroundColor: STATUS_COLORS[s] },
                                task.status !== s && { opacity: 0.5 }
                            ]}>
                            <Text style={[
                                styles.statusText,
                                { color: task.status === s ? COLORS.white : STATUS_COLORS[s] },
                            ]}>
                                {s}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Atananlar */}
                {task.assignees?.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>ATANANLAR</Text>
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
                        <Text style={styles.sectionTitle}>ETİKETLER</Text>
                        <View style={styles.labelsRow}>
                            {task.labels.map((l) => (
                                <View key={l.id} style={styles.labelChip}>
                                    <Text style={styles.labelText}>{l.name}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Sil Butonu */}
                <TouchableOpacity
                    style={[styles.deleteBtn, deleting && { opacity: 0.5 }]}
                    onPress={() => setShowDeleteModal(true)}
                    disabled={deleting}>
                    {deleting
                        ? <ActivityIndicator size="small" color="#EF4444" />
                        : (
                            <View style={styles.deleteBtnInner}>
                                <Feather name="trash-2" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                                <Text style={styles.deleteText}>Görevi Sil</Text>
                            </View>
                        )}
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Delete Confirmation Modal */}
            <Modal
                transparent
                visible={showDeleteModal}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalIconWrap}>
                            <Feather name="trash-2" size={28} color="#EF4444" />
                        </View>
                        <Text style={styles.modalTitle}>Görevi Sil</Text>
                        <Text style={styles.modalMessage}>
                            Bu görevi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setShowDeleteModal(false)}>
                                <Text style={styles.cancelText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmDeleteBtn}
                                onPress={performDelete}>
                                <Text style={styles.confirmDeleteText}>Sil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingBottom: 40 },
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
    sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 10, marginTop: 24 },
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
        marginTop: 48,
        backgroundColor: '#EF444415',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF444440',
    },
    deleteBtnInner: { flexDirection: 'row', alignItems: 'center' },
    deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
    errorText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalBox: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 28,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EF444420',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },
    confirmDeleteBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
    },
    confirmDeleteText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});

export default TaskDetailScreen;
