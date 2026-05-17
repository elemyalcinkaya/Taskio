import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { taskService } from '../../services/taskService';
import { boardService } from '../../services/boardService';
import { followService } from '../../services/followService';
import { useAuth } from '../../context/AuthContext';
import { uiStatusToApi } from '../../utils/taskStatus';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const LABEL_OPTIONS = ['Design', 'Dev', 'Bug', 'Content', 'Testing', 'Release'];

const LABEL_COLORS = {
    Design: '#8B5CF6',
    Dev: '#3B82F6',
    Bug: '#EF4444',
    Content: '#10B981',
    Testing: '#F59E0B',
    Release: '#06B6D4',
};

const AddTaskScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    // task param is passed when we want to edit an existing task
    const { boardId, defaultStatus, task } = route?.params || {};
    const isEditMode = !!task;

    const [boards, setBoards] = useState([]);
    const [loadingBoards, setLoadingBoards] = useState(false);
    
    // task nesnesi normalizeTaskForUi'dan geçtiği için status UI formatında gelir ("To Do" gibi)
    // Her iki formatı da destekle
    const apiToUiStatus = {
        TODO: 'To Do',
        IN_PROGRESS: 'In Progress',
        REVIEW: 'Review',
        DONE: 'Done'
    };
    // UI format zaten doğruysa direkt kullan, değilse API→UI çevir
    const uiStatuses = ['To Do', 'In Progress', 'Review', 'Done'];

    const getInitialStatus = () => {
        if (!task) return defaultStatus || 'To Do';
        const s = task.status;
        if (uiStatuses.includes(s)) return s;           // zaten UI format
        if (apiToUiStatus[s]) return apiToUiStatus[s];  // API format, çevir
        return defaultStatus || 'To Do';
    };

    const [form, setForm] = useState({
        title: task ? task.title : '',
        description: task && task.description ? task.description : '',
        boardId: task && task.boardId ? String(task.boardId) : (boardId != null ? String(boardId) : ''),
        status: getInitialStatus(),
        priority: task && task.priority ? task.priority : 'MEDIUM',
        labels: task && task.labels ? task.labels.map(l => l.name) : [],
        assignees: task && task.assignees ? task.assignees : [],
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Atanan kişiler
    const [followingUsers, setFollowingUsers] = useState([]);
    const [showAssigneePicker, setShowAssigneePicker] = useState(false);
    const [selectedAssignees, setSelectedAssignees] = useState(
        task?.assignees ? task.assignees.map(a => a.id) : []
    );

    useEffect(() => {
        if (user?.id) {
            // Her iki yönden bağlantılar (getConnections) — görev atama için
            followService.getConnections(user.id)
                .then(setFollowingUsers)
                .catch(() => {});
        }
    }, [user?.id]);

    useEffect(() => {
        if (boardId != null || isEditMode || !user?.id) return;
        let cancelled = false;
        (async () => {
            setLoadingBoards(true);
            try {
                const list = await boardService.getBoards(user.id);
                if (!cancelled) setBoards(list);
            } catch {
                if (!cancelled) setBoards([]);
            } finally {
                if (!cancelled) setLoadingBoards(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [boardId, isEditMode, user?.id]);

    const toggleLabel = (label) => {
        setForm((prev) => ({
            ...prev,
            labels: prev.labels.includes(label)
                ? prev.labels.filter((l) => l !== label)
                : [...prev.labels, label],
        }));
    };

    const toggleAssignee = (userId) => {
        setSelectedAssignees(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            Alert.alert('Hata', 'Görev başlığı boş bırakılamaz.');
            return;
        }
        if (!user?.id) {
            Alert.alert('Hata', 'Oturum bulunamadı. Tekrar giriş yapın.');
            return;
        }

        setLoading(true);
        let finalBoardId = form.boardId ? Number(form.boardId) : null;

        try {
            if (!isEditMode) {
                // boardId geçersizse (seçilmediyse veya NaN ise) Inbox mantığı
                if (!finalBoardId || Number.isNaN(finalBoardId)) {
                    // Önce mevcut panoların yüklü olup olmadığını kontrol et
                    let boardList = boards;
                    if (boardList.length === 0) {
                        try {
                            boardList = await boardService.getBoards(user.id);
                            setBoards(boardList);
                        } catch {
                            boardList = [];
                        }
                    }

                    let inbox = boardList.find(
                        b => b.name.toLowerCase() === 'inbox' || b.name.toLowerCase() === 'kişisel'
                    );
                    if (inbox) {
                        finalBoardId = inbox.id;
                    } else {
                        // Inbox panosu yok, oluştur!
                        const newInbox = await boardService.createBoard(
                            { name: 'Inbox', description: 'Kişisel görevlerim', color: '#8B5CF6' },
                            user.id
                        );
                        finalBoardId = newInbox.id;
                        setBoards(prev => [...prev, newInbox]);
                    }
                }
            }

            // Son kontrol: boardId hâlâ geçersizse kaydetme
            const effectiveBoardId = isEditMode ? (task.boardId ? Number(task.boardId) : null) : finalBoardId;
            if (!effectiveBoardId || Number.isNaN(effectiveBoardId)) {
                Alert.alert('Hata', 'Lütfen bir pano seçin.');
                setLoading(false);
                return;
            }

            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                boardId: effectiveBoardId,
                status: uiStatusToApi(form.status),
                priority: form.priority,
            };

            if (isEditMode) {
                await taskService.updateTask(task.id, payload, user.id);
                // Seçili kişileri ata
                await Promise.allSettled(
                    selectedAssignees.map(uid =>
                        taskService.assignUser(task.id, uid, user.id)
                    )
                );
                setShowSuccessPopup(true);
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    navigation.goBack();
                }, 1500);
            } else {
                const created = await taskService.createTask(payload, user.id);
                // Seçili kişileri ata
                if (created?.id && selectedAssignees.length > 0) {
                    await Promise.allSettled(
                        selectedAssignees.map(uid =>
                            taskService.assignUser(created.id, uid, user.id)
                        )
                    );
                }
                setShowSuccessPopup(true);
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    navigation.goBack();
                }, 1500);
            }
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.title ||
                (error.response?.status === 400 ? 'Geçersiz veri gönderildi. Lütfen formu kontrol edin.' :
                error.response?.status === 404 ? 'Pano veya kullanıcı bulunamadı.' :
                error.message === 'Network Error' ? 'Sunucuya ulaşılamıyor. Ağ bağlantını kontrol et.' :
                `Görev ${isEditMode ? 'güncellenemedi' : 'oluşturulamadı'}.`);
            Alert.alert('Hata', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelBtn}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Görevi Düzenle' : 'Yeni Görev'}</Text>
                <TouchableOpacity style={styles.createBtn} onPress={handleSave} disabled={loading}>
                    {loading
                        ? <ActivityIndicator size="small" color={COLORS.white} />
                        : <Text style={styles.createBtnText}>{isEditMode ? 'Kaydet' : 'Oluştur'}</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                {/* Başlık */}
                <Text style={styles.label}>GÖREV BAŞLIĞI *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ör. Yeni splash screen tasarla"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.title}
                    onChangeText={(v) => setForm({ ...form, title: v })}
                />

                {/* Açıklama */}
                <Text style={styles.label}>AÇIKLAMA</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Bu görev hakkında daha fazla bağlam ekle..."
                    placeholderTextColor={COLORS.textMuted}
                    value={form.description}
                    onChangeText={(v) => setForm({ ...form, description: v })}
                    multiline
                    numberOfLines={4}
                />

                {boardId == null && (
                    <>
                        <Text style={styles.label}>PANO</Text>
                        {loadingBoards ? (
                            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
                        ) : boards.length === 0 ? (
                            <Text style={styles.hintText}>
                                Pano bulunamadı. Görev otomatik olarak "Inbox" panonuza eklenecektir.
                            </Text>
                        ) : (
                            <View style={styles.chipRow}>
                                {boards.map((b) => (
                                    <TouchableOpacity
                                        key={b.id}
                                        style={[
                                            styles.chip,
                                            form.boardId === String(b.id) && styles.chipActive,
                                        ]}
                                        onPress={() => setForm({ ...form, boardId: String(b.id) })}>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                form.boardId === String(b.id) && styles.chipTextActive,
                                            ]}
                                            numberOfLines={1}>
                                            {b.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <Text style={styles.hintText}>* Boş bırakırsanız Inbox'a eklenir.</Text>
                            </View>
                        )}
                    </>
                )}

                {/* Durum */}
                <Text style={styles.label}>DURUM</Text>
                <View style={styles.chipRow}>
                    {STATUSES.map((s) => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.chip, form.status === s && styles.chipActive]}
                            onPress={() => setForm({ ...form, status: s })}>
                            <Text style={[styles.chipText, form.status === s && styles.chipTextActive]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Öncelik */}
                <Text style={styles.label}>ÖNCELİK</Text>
                <View style={styles.chipRow}>
                    {PRIORITIES.map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.chip, form.priority === p && styles.chipActive]}
                            onPress={() => setForm({ ...form, priority: p })}>
                            <Text style={[styles.chipText, form.priority === p && styles.chipTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Etiketler */}
                <Text style={styles.label}>ETİKETLER</Text>
                <View style={styles.chipRow}>
                    {LABEL_OPTIONS.map((l) => (
                        <TouchableOpacity
                            key={l}
                            style={[
                                styles.chip,
                                form.labels.includes(l) && { backgroundColor: LABEL_COLORS[l], borderColor: LABEL_COLORS[l] },
                            ]}
                            onPress={() => toggleLabel(l)}>
                            <Text style={[styles.chipText, form.labels.includes(l) && styles.chipTextActive]}>
                                {l}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Atananlar */}
                <Text style={styles.label}>ATANACAK KİŞİLER</Text>
                <TouchableOpacity
                    style={styles.assigneePickerBtn}
                    onPress={() => setShowAssigneePicker(true)}
                >
                    <Feather name="user-plus" size={16} color={COLORS.primary} />
                    <Text style={styles.assigneePickerBtnText}>
                        {selectedAssignees.length === 0
                            ? 'Kişi Seç'
                            : `${selectedAssignees.length} kişi seçildi`}
                    </Text>
                </TouchableOpacity>
                {selectedAssignees.length > 0 && (
                    <View style={styles.selectedAssigneesRow}>
                        {followingUsers.filter(u => selectedAssignees.includes(u.id)).map(u => (
                            <View key={u.id} style={styles.assigneeChip}>
                                <View style={styles.assigneeMiniAvatar}>
                                    <Text style={styles.assigneeMiniAvatarText}>
                                        {(u.name || 'U').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.assigneeChipText}>{u.name}</Text>
                                <TouchableOpacity onPress={() => toggleAssignee(u.id)}>
                                    <Feather name="x" size={12} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Assignee Picker Modal */}
            <Modal visible={showAssigneePicker} animationType="slide" transparent onRequestClose={() => setShowAssigneePicker(false)}>
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupContent, { width: '90%', maxHeight: '70%', alignItems: 'stretch' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={styles.pickerTitle}>Kişi Seç</Text>
                            <TouchableOpacity onPress={() => setShowAssigneePicker(false)}>
                                <Feather name="x" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {followingUsers.length === 0 ? (
                            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                                <Feather name="users" size={40} color={COLORS.textMuted} />
                                <Text style={{ color: COLORS.textSecondary, marginTop: 12, textAlign: 'center' }}>
                                    Henüz kimseyi takip etmiyorsunuz.{'\n'}Profil &gt; Kişiler bölümünden takip edebilirsiniz.
                                </Text>
                            </View>
                        ) : (
                            followingUsers.map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={[styles.pickerRow, selectedAssignees.includes(u.id) && styles.pickerRowSelected]}
                                    onPress={() => toggleAssignee(u.id)}
                                >
                                    <View style={styles.pickerAvatar}>
                                        <Text style={styles.pickerAvatarText}>{(u.name || 'U').charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.pickerName}>{u.name}</Text>
                                        <Text style={styles.pickerRole}>{u.role || u.email}</Text>
                                    </View>
                                    {selectedAssignees.includes(u.id) && (
                                        <Feather name="check-circle" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                        <TouchableOpacity style={[styles.popupIconContainer, { width: '100%', borderRadius: 12, marginTop: 16, height: 48 }]} onPress={() => setShowAssigneePicker(false)}>
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Tamam</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Başarı Popup */}
            <Modal visible={showSuccessPopup} transparent animationType="fade">
                <View style={styles.popupOverlay}>
                    <View style={styles.popupContent}>
                        <View style={styles.popupIconContainer}>
                            <Feather name="check" size={32} color={COLORS.white} />
                        </View>
                        <Text style={styles.popupText}>
                            {isEditMode ? 'Görev Düzenlendi' : 'Görev Oluşturuldu'}
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    cancelBtn: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    createBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    createBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
    form: { flex: 1, padding: 20 },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textMuted,
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 20,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        color: COLORS.text,
        fontSize: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
    chipTextActive: { color: COLORS.white },
    hintText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContent: {
        backgroundColor: COLORS.surface,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    popupIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    popupText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    // Assignee styles
    assigneePickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    assigneePickerBtnText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    selectedAssigneesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    assigneeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    assigneeMiniAvatar: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assigneeMiniAvatarText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    assigneeChipText: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
    pickerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: COLORS.background,
    },
    pickerRowSelected: {
        backgroundColor: `${COLORS.primary}20`,
        borderWidth: 1,
        borderColor: `${COLORS.primary}40`,
    },
    pickerAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    pickerName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    pickerRole: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AddTaskScreen;
