import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const PRIORITY_CONFIG = {
    URGENT: { color: '#EF4444', bg: '#FEF2F2', label: 'Acil',   icon: 'alert-circle' },
    HIGH:   { color: '#F59E0B', bg: '#FFFBEB', label: 'Yüksek', icon: 'arrow-up' },
    MEDIUM: { color: '#6366F1', bg: '#EEF2FF', label: 'Orta',   icon: 'minus' },
    LOW:    { color: '#10B981', bg: '#ECFDF5', label: 'Düşük',  icon: 'arrow-down' },
};

const STATUS_LEFT_COLOR = {
    'To Do':       '#94A3B8',
    'In Progress': '#3B82F6',
    'Review':      '#F59E0B',
    'Done':        '#10B981',
};

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#06B6D4'];

function strToColor(str) {
    if (!str) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const TaskCard = ({ task, onPress }) => {
    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const leftColor = STATUS_LEFT_COLOR[task.status] || '#94A3B8';
    const assignees = task.assignees || [];

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
    const dueDateLabel = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
        : null;

    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: leftColor }]}
            onPress={onPress}
            activeOpacity={0.82}
        >
            {/* Üst satır: priority badge + board adı */}
            <View style={styles.topRow}>
                <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
                    <Feather name={priority.icon} size={10} color={priority.color} />
                    <Text style={[styles.priorityText, { color: priority.color }]}>
                        {priority.label}
                    </Text>
                </View>
                {task.boardName && (
                    <Text style={styles.boardLabel} numberOfLines={1}>{task.boardName}</Text>
                )}
            </View>

            {/* Başlık */}
            <Text style={styles.title} numberOfLines={2}>{task.title}</Text>

            {/* Açıklama */}
            {task.description ? (
                <Text style={styles.desc} numberOfLines={1}>{task.description}</Text>
            ) : null}

            {/* Alt satır: tarih (sol) + avatarlar (sağ alt) */}
            <View style={styles.bottomRow}>
                {/* Bitiş tarihi */}
                {dueDateLabel ? (
                    <View style={[styles.dueDateBadge, isOverdue && styles.overdueBadge]}>
                        <Feather name="calendar" size={10} color={isOverdue ? '#EF4444' : '#94A3B8'} />
                        <Text style={[styles.dueDateText, isOverdue && styles.overdueDateText]}>
                            {dueDateLabel}
                        </Text>
                    </View>
                ) : <View />}

                {/* Atanan kişi avatarları — sağ alt */}
                {assignees.length > 0 && (
                    <View style={styles.avatarsRow}>
                        {assignees.slice(0, 4).map((a, i) => (
                            <View
                                key={a.id}
                                style={[
                                    styles.assigneeAvatar,
                                    {
                                        backgroundColor: strToColor(a.name),
                                        marginLeft: i === 0 ? 0 : -9,
                                        zIndex: 20 - i,
                                    },
                                ]}
                            >
                                <Text style={styles.assigneeAvatarText}>
                                    {(a.name || '?').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        ))}
                        {assignees.length > 4 && (
                            <View style={[styles.assigneeAvatar, styles.moreAvatar, { marginLeft: -9, zIndex: 0 }]}>
                                <Text style={styles.moreAvatarText}>+{assignees.length - 4}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',       // beyaz arka plan
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    priorityText: { fontSize: 11, fontWeight: '700' },
    boardLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '500',
        maxWidth: 110,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',      // koyu gri — beyaz kart üzerinde net okunur
        lineHeight: 20,
        marginBottom: 4,
    },
    desc: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 17,
        marginBottom: 10,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    dueDateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    overdueBadge: { backgroundColor: '#FEE2E2' },
    dueDateText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
    overdueDateText: { color: '#EF4444', fontWeight: '700' },

    // Avatarlar — sağ alt
    avatarsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assigneeAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    assigneeAvatarText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
    },
    moreAvatar: {
        backgroundColor: '#E2E8F0',
    },
    moreAvatarText: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '700',
    },
});

export default TaskCard;
