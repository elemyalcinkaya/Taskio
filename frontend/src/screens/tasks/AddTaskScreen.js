import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { taskService } from '../../services/taskService';

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
    const { boardId, defaultStatus } = route?.params || {};
    const [form, setForm] = useState({
        title: '',
        description: '',
        boardId: boardId || '',
        status: defaultStatus || 'To Do',
        priority: 'MEDIUM',
        labels: [],
        assignees: [],
    });
    const [loading, setLoading] = useState(false);

    const toggleLabel = (label) => {
        setForm((prev) => ({
            ...prev,
            labels: prev.labels.includes(label)
                ? prev.labels.filter((l) => l !== label)
                : [...prev.labels, label],
        }));
    };

    const handleCreate = async () => {
        if (!form.title.trim()) {
            Alert.alert('Hata', 'Görev başlığı boş bırakılamaz.');
            return;
        }
        setLoading(true);
        try {
            await taskService.createTask(form);
            Alert.alert('Başarılı', 'Görev oluşturuldu.', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.message || 'Görev oluşturulamadı.');
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
                <Text style={styles.headerTitle}>✨ Yeni Görev</Text>
                <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
                    {loading
                        ? <ActivityIndicator size="small" color={COLORS.white} />
                        : <Text style={styles.createBtnText}>Oluştur</Text>}
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

                <View style={{ height: 40 }} />
            </ScrollView>
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
});

export default AddTaskScreen;
