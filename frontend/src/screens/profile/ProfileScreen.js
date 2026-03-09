import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get(ENDPOINTS.GET_PROFILE);
            setProfile(res.data);
        } catch (error) {
            console.error('Profile load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Çıkış Yap', 'Oturumunuzu kapatmak istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
        ]);
    };

    const MENU_ITEMS = [
        { icon: '👤', title: 'Kişisel Bilgiler', subtitle: 'Ad, e-posta, rol', section: 'HESAP' },
        { icon: '🔔', title: 'Bildirimler', subtitle: 'Push, e-posta bildirimleri', section: '' },
        { icon: '🔒', title: 'Gizlilik & Güvenlik', subtitle: 'Şifre, 2FA', section: '' },
        { icon: '🎨', title: 'Görünüm', subtitle: 'Tema, renkler, fontlar', section: 'TERCİHLER' },
        { icon: '📋', title: 'Çalışma Alanı', subtitle: 'Varsayılan pano ayarları', section: '' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profil</Text>
                    <TouchableOpacity>
                        <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar & İsim */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
                    <Text style={styles.userRole}>{profile?.role || 'Üye'}</Text>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Aktif</Text>
                    </View>
                </View>

                {/* İstatistikler */}
                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />
                ) : (
                    <View style={styles.statsRow}>
                        {[
                            { label: 'Tamamlanan', value: profile?.completedTasks || 0, color: COLORS.primary },
                            { label: 'Aktif', value: profile?.activeTasks || 0, color: COLORS.secondary },
                            { label: 'Panolar', value: profile?.boardCount || 0, color: COLORS.primaryLight },
                        ].map((stat) => (
                            <View key={stat.label} style={styles.statItem}>
                                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Menü Öğeleri */}
                {['HESAP', 'TERCİHLER'].map((section) => (
                    <View key={section}>
                        <Text style={styles.sectionTitle}>{section}</Text>
                        {MENU_ITEMS.filter((item) => item.section === section || (section === 'HESAP' && item.section === '')).slice(0, section === 'HESAP' ? 3 : 2).map((item) => (
                            <TouchableOpacity key={item.title} style={styles.menuItem}>
                                <View style={styles.menuIconContainer}>
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>
                                <Text style={styles.menuArrow}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Çıkış */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
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
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
    editIcon: { fontSize: 20 },
    profileSection: { alignItems: 'center', paddingVertical: 20 },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
    userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    userRole: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B98120',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
    statusText: { color: '#10B981', fontSize: 13, fontWeight: '600' },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 24,
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { fontSize: 12, color: COLORS.textSecondary },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textMuted,
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 8,
        marginTop: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        marginBottom: 2,
        borderRadius: 12,
        padding: 14,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuIcon: { fontSize: 18 },
    menuContent: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
    menuSubtitle: { fontSize: 12, color: COLORS.textSecondary },
    menuArrow: { fontSize: 20, color: COLORS.textMuted },
    logoutBtn: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: '#EF444420',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
});

export default ProfileScreen;
