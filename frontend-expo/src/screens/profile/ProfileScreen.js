import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, SafeAreaView,
    TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Switch, FlatList
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

import { Feather } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState('');
    const [saving, setSaving] = useState(false);

    // Additional Modals State
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);
    
    // Tasks Modal
    const [isTasksModalVisible, setIsTasksModalVisible] = useState(false);
    const [tasksModalType, setTasksModalType] = useState('DONE'); // 'DONE' or 'ACTIVE'
    const [userTasks, setUserTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    // Mock Settings
    const [pushNotif, setPushNotif] = useState(true);
    const [emailNotif, setEmailNotif] = useState(false);

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        loadProfile();
    }, [user?.id]);

    const loadProfile = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(ENDPOINTS.GET_PROFILE, {
                params: { userId: user.id }
            });
            setProfile(res.data);
            setEditName(res.data.name || '');
            setEditRole(res.data.role || '');
        } catch (error) {
            console.error('Profile load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!editName.trim()) {
            Alert.alert('Hata', 'İsim alanı boş bırakılamaz.');
            return;
        }

        setSaving(true);
        try {
            const res = await api.put(ENDPOINTS.UPDATE_PROFILE, {
                name: editName,
                role: editRole
            }, {
                params: { userId: user.id }
            });
            
            // Backend'den güncel veriler dönünce local state'leri güncelle
            setProfile(res.data);
            updateUser({ name: res.data.name, role: res.data.role });
            setIsEditModalVisible(false);
        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const fetchUserTasks = async (type) => {
        setTasksModalType(type);
        setIsTasksModalVisible(true);
        setTasksLoading(true);
        try {
            const res = await api.get(ENDPOINTS.GET_USER_TASKS, { params: { userId: user.id } });
            const allTasks = res.data;
            if (type === 'DONE') {
                setUserTasks(allTasks.filter(t => t.status === 'DONE'));
            } else {
                setUserTasks(allTasks.filter(t => t.status !== 'DONE'));
            }
        } catch (error) {
            console.error('Tasks fetch error:', error);
            Alert.alert('Hata', 'Görevler yüklenemedi.');
            setIsTasksModalVisible(false);
        } finally {
            setTasksLoading(false);
        }
    };

    const handleMenuPress = (title) => {
        if (title === 'Kişisel Bilgiler') {
            setIsEditModalVisible(true);
        } else if (title === 'Bildirimler') {
            setIsNotifModalVisible(true);
        } else if (title === 'Gizlilik & Güvenlik') {
            setIsPasswordModalVisible(true);
        } else if (title === 'Kişiler') {
            navigation.navigate('People');
        } else {
            Alert.alert('Bilgi', `${title} sayfası henüz yapım aşamasında.`);
        }
    };

    const handlePasswordChange = () => {
        if (!oldPassword || !newPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }
        // Mock password change success
        Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
        setIsPasswordModalVisible(false);
        setOldPassword('');
        setNewPassword('');
    };

    const MENU_ITEMS = [
        { icon: 'user', title: 'Kişisel Bilgiler', subtitle: 'Ad, e-posta, rol', section: 'HESAP' },
        { icon: 'bell', title: 'Bildirimler', subtitle: 'Push, e-posta bildirimleri', section: '' },
        { icon: 'lock', title: 'Gizlilik & Güvenlik', subtitle: 'Şifre, 2FA', section: '' },
        { icon: 'users', title: 'Kişiler', subtitle: 'Takip et, görev ata', section: '' },
        { icon: 'layout', title: 'Çalışma Alanı', subtitle: 'Varsayılan pano ayarları', section: 'TERCİHLER' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profil</Text>
                    <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
                        <Feather name="edit-3" size={20} color={COLORS.text} />
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
                            { label: 'Tamamlanan', value: profile?.completedTasks || 0, color: COLORS.primary, type: 'DONE' },
                            { label: 'Aktif', value: profile?.activeTasks || 0, color: COLORS.secondary, type: 'ACTIVE' },
                            { label: 'Panolar', value: profile?.boardCount || 0, color: COLORS.primaryLight, type: 'BOARDS' },
                        ].map((stat) => (
                            <TouchableOpacity 
                                key={stat.label} 
                                style={styles.statItem}
                                onPress={() => {
                                    if (stat.type === 'DONE' || stat.type === 'ACTIVE') fetchUserTasks(stat.type);
                                }}
                                disabled={stat.type === 'BOARDS'}
                            >
                                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Menü Öğeleri */}
                {['HESAP', 'TERCİHLER'].map((section) => (
                    <View key={section}>
                        <Text style={styles.sectionTitle}>{section}</Text>
                        {MENU_ITEMS.filter((item) => item.section === section || (section === 'HESAP' && item.section === '')).map((item) => (
                            <TouchableOpacity 
                                key={item.title} 
                                style={styles.menuItem}
                                onPress={() => handleMenuPress(item.title)}
                            >
                                <View style={styles.menuIconContainer}>
                                    <Feather name={item.icon} size={18} color={COLORS.text} />
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

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Kişisel Bilgileri Düzenle</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Ad Soyad</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Adınızı girin"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Rol / Unvan</Text>
                            <TextInput
                                style={styles.input}
                                value={editRole}
                                onChangeText={setEditRole}
                                placeholder="Örn: Frontend Developer"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.cancelBtn]} 
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.saveBtn]} 
                                onPress={handleUpdateProfile}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Kaydet</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Password Modal */}
            <Modal visible={isPasswordModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsPasswordModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mevcut Şifre</Text>
                            <TextInput style={styles.input} secureTextEntry value={oldPassword} onChangeText={setOldPassword} placeholder="********" />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Yeni Şifre</Text>
                            <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="********" />
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsPasswordModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handlePasswordChange}>
                                <Text style={styles.saveBtnText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Notifications Modal */}
            <Modal visible={isNotifModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsNotifModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={styles.inputLabel}>Push Bildirimleri</Text>
                            <Switch value={pushNotif} onValueChange={setPushNotif} trackColor={{ true: COLORS.primary }} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={styles.inputLabel}>E-Posta Bildirimleri</Text>
                            <Switch value={emailNotif} onValueChange={setEmailNotif} trackColor={{ true: COLORS.primary }} />
                        </View>
                        <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { marginTop: 10 }]} onPress={() => setIsNotifModalVisible(false)}>
                            <Text style={styles.saveBtnText}>Kapat</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Tasks Modal */}
            <Modal visible={isTasksModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsTasksModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '70%' }]}>
                        <Text style={styles.modalTitle}>{tasksModalType === 'DONE' ? 'Tamamlanan Görevler' : 'Aktif Görevler'}</Text>
                        {tasksLoading ? (
                            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                        ) : userTasks.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 }}>Görev bulunamadı.</Text>
                        ) : (
                            <FlatList
                                data={userTasks}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={{ padding: 16, backgroundColor: COLORS.background, borderRadius: 12, marginBottom: 10 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>{item.title}</Text>
                                        <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 4 }}>Pano: {item.boardName}</Text>
                                    </View>
                                )}
                            />
                        )}
                        <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, { marginTop: 20 }]} onPress={() => setIsTasksModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>Kapat</Text>
                        </TouchableOpacity>
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: COLORS.surfaceLight,
        marginRight: 10,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        marginLeft: 10,
    },
    cancelBtnText: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 16,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ProfileScreen;
