import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TextInput,
    FlatList, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { followService } from '../../services/followService';

const TABS = ['search', 'following', 'requests'];

const PeopleScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [following, setFollowing] = useState([]);
    const [requests, setRequests] = useState([]);
    const [tab, setTab] = useState('search');
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        if (!user?.id) return;
        setListLoading(true);
        try {
            const [f, r] = await Promise.all([
                followService.getFollowing(user.id),
                followService.getFollowRequests(user.id),
            ]);
            setFollowing(f);
            setRequests(r);
        } catch (e) {
            console.error('People load error:', e);
        } finally {
            setListLoading(false);
        }
    };

    const handleSearch = useCallback(async (q) => {
        setSearchQuery(q);
        if (q.trim().length < 2) { setSearchResults([]); return; }
        setLoading(true);
        try {
            const results = await followService.searchUsers(user.id, q.trim());
            setSearchResults(results);
        } catch (e) {
            console.error('Search error:', e);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const handleFollow = async (targetUser) => {
        try {
            if (targetUser.isFollowing) {
                // Takibi bırak
                await followService.unfollow(user.id, targetUser.id);
                setSearchResults(prev => prev.map(u =>
                    u.id === targetUser.id ? { ...u, isFollowing: false, isPending: false } : u
                ));
                setFollowing(prev => prev.filter(u => u.id !== targetUser.id));
            } else if (targetUser.isPending) {
                // İsteği geri çek
                await followService.unfollow(user.id, targetUser.id);
                setSearchResults(prev => prev.map(u =>
                    u.id === targetUser.id ? { ...u, isPending: false } : u
                ));
            } else {
                // Takip isteği gönder
                await followService.follow(user.id, targetUser.id);
                setSearchResults(prev => prev.map(u =>
                    u.id === targetUser.id ? { ...u, isPending: true } : u
                ));
            }
        } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'Bir hata oluştu.');
        }
    };

    const handleUnfollowFromList = async (targetUser) => {
        try {
            await followService.unfollow(user.id, targetUser.id);
            setFollowing(prev => prev.filter(u => u.id !== targetUser.id));
            setSearchResults(prev => prev.map(u =>
                u.id === targetUser.id ? { ...u, isFollowing: false, isPending: false } : u
            ));
        } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'Takip bırakılamadı.');
        }
    };

    const handleApprove = async (req) => {
        try {
            await followService.approveFollow(req.followId, user.id);
            setRequests(prev => prev.filter(r => r.followId !== req.followId));
            // Yeni takipçiyi ekle
            setFollowing(prev => [...prev, {
                id: req.requesterId,
                name: req.requesterName,
                email: req.requesterEmail,
                role: req.requesterRole,
            }]);
        } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'İstek kabul edilemedi.');
        }
    };

    const handleReject = async (req) => {
        try {
            await followService.rejectFollow(req.followId, user.id);
            setRequests(prev => prev.filter(r => r.followId !== req.followId));
        } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'İstek reddedilemedi.');
        }
    };

    const getFollowBtnState = (item) => {
        if (item.isFollowing) return { label: 'Takipte', style: 'following' };
        if (item.isPending) return { label: 'İstek Gönderildi', style: 'pending' };
        return { label: 'Takip Et', style: 'none' };
    };

    const renderSearchItem = ({ item }) => {
        const btn = getFollowBtnState(item);
        return (
            <View style={styles.userCard}>
                <View style={[styles.avatar, { backgroundColor: strToColor(item.name) }]}>
                    <Text style={styles.avatarText}>{(item.name || 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userRole}>{item.role || item.email}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.followBtn,
                        btn.style === 'following' && styles.followingBtn,
                        btn.style === 'pending' && styles.pendingBtn,
                    ]}
                    onPress={() => handleFollow(item)}
                >
                    <Text style={[styles.followBtnText,
                        (btn.style === 'following' || btn.style === 'pending') && styles.followingBtnText,
                    ]}>
                        {btn.label}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFollowingItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: strToColor(item.name) }]}>
                <Text style={styles.avatarText}>{(item.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>{item.role || item.email}</Text>
            </View>
            <View style={styles.acceptedBadge}>
                <Feather name="check" size={12} color="#10B981" />
                <Text style={styles.acceptedText}>Onaylı</Text>
            </View>
            <TouchableOpacity style={styles.unfollowBtn} onPress={() => handleUnfollowFromList(item)}>
                <Feather name="user-minus" size={16} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    const renderRequestItem = ({ item }) => (
        <View style={styles.requestCard}>
            <View style={[styles.avatar, { backgroundColor: strToColor(item.requesterName) }]}>
                <Text style={styles.avatarText}>{(item.requesterName || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.requesterName}</Text>
                <Text style={styles.userRole}>{item.requesterRole || item.requesterEmail}</Text>
                <Text style={styles.requestSubtitle}>Seni takip etmek istiyor</Text>
            </View>
            <View style={styles.requestActions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item)}>
                    <Feather name="check" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item)}>
                    <Feather name="x" size={16} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kişiler</Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'search' && styles.activeTab]}
                    onPress={() => setTab('search')}
                >
                    <Feather name="search" size={14} color={tab === 'search' ? COLORS.primary : COLORS.textMuted} />
                    <Text style={[styles.tabText, tab === 'search' && styles.activeTabText]}>Ara</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, tab === 'following' && styles.activeTab]}
                    onPress={() => setTab('following')}
                >
                    <Feather name="users" size={14} color={tab === 'following' ? COLORS.primary : COLORS.textMuted} />
                    <Text style={[styles.tabText, tab === 'following' && styles.activeTabText]}>
                        Takip{following.length > 0 ? ` (${following.length})` : ''}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, tab === 'requests' && styles.activeTab]}
                    onPress={() => setTab('requests')}
                >
                    <View style={{ position: 'relative' }}>
                        <Feather name="bell" size={14} color={tab === 'requests' ? COLORS.primary : COLORS.textMuted} />
                        {requests.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{requests.length}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.tabText, tab === 'requests' && styles.activeTabText]}>
                        İstekler
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Tab */}
            {tab === 'search' && (
                <View style={{ flex: 1 }}>
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="İsim veya e-posta ile ara..."
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCapitalize="none"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                                <Feather name="x" size={16} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Onay kuralı uyarısı */}
                    <View style={styles.infoBox}>
                        <Feather name="info" size={14} color={COLORS.primary} />
                        <Text style={styles.infoText}>
                            Kişi isteğini onayladığında görevlere atayabilirsin.
                        </Text>
                    </View>
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : searchQuery.trim().length < 2 ? (
                        <View style={styles.emptyState}>
                            <Feather name="user-plus" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>Kullanıcı Ara</Text>
                            <Text style={styles.emptySubtitle}>En az 2 karakter gir</Text>
                        </View>
                    ) : searchResults.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Feather name="search" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderSearchItem}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                </View>
            )}

            {/* Following Tab */}
            {tab === 'following' && (
                <View style={{ flex: 1 }}>
                    {listLoading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : following.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Feather name="users" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>Onaylı takibiniz yok</Text>
                            <Text style={styles.emptySubtitle}>
                                Ara sekmesinden istek gönder; karşı taraf onayladığında buraya gelir
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={following}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderFollowingItem}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                </View>
            )}

            {/* Requests Tab */}
            {tab === 'requests' && (
                <View style={{ flex: 1 }}>
                    {listLoading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : requests.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Feather name="bell" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>Bekleyen istek yok</Text>
                            <Text style={styles.emptySubtitle}>Seni takip etmek isteyen biri olunca burada görürsün</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={requests}
                            keyExtractor={(item) => item.followId.toString()}
                            renderItem={renderRequestItem}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

// İsimden deterministik renk üret
function strToColor(str) {
    if (!str) return COLORS.primary;
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#06B6D4'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, paddingBottom: 12,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    tabBar: {
        flexDirection: 'row', marginHorizontal: 16,
        backgroundColor: COLORS.surface, borderRadius: 14,
        padding: 4, marginBottom: 8,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, paddingVertical: 8, borderRadius: 10,
    },
    activeTab: { backgroundColor: COLORS.background },
    tabText: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted },
    activeTabText: { color: COLORS.primary, fontWeight: '700' },
    badge: {
        position: 'absolute', top: -6, right: -8,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
    },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 8,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1, borderColor: COLORS.border,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },
    infoBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: `${COLORS.primary}15`,
        marginHorizontal: 16, marginBottom: 4,
        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
        borderWidth: 1, borderColor: `${COLORS.primary}30`,
    },
    infoText: { color: COLORS.textSecondary, fontSize: 12, flex: 1, lineHeight: 17 },
    userCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: 14,
        padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: COLORS.border,
    },
    requestCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: 14,
        padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: `${COLORS.primary}30`,
    },
    avatar: {
        width: 42, height: 42, borderRadius: 21,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    userInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    userRole: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    requestSubtitle: { fontSize: 11, color: COLORS.primary, marginTop: 3, fontWeight: '500' },
    followBtn: {
        backgroundColor: COLORS.primary, paddingHorizontal: 12,
        paddingVertical: 7, borderRadius: 20,
    },
    followingBtn: {
        backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary,
    },
    pendingBtn: {
        backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.textMuted,
    },
    followBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    followingBtnText: { color: COLORS.primary },
    acceptedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: '#10B98115', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 10, marginRight: 8,
    },
    acceptedText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
    unfollowBtn: {
        padding: 8, borderRadius: 10,
        backgroundColor: '#EF444415', borderWidth: 1, borderColor: '#EF444430',
    },
    requestActions: { flexDirection: 'row', gap: 8 },
    approveBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
    },
    rejectBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#EF444415', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#EF444440',
    },
    emptyState: { alignItems: 'center', marginTop: 80, gap: 12, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.textSecondary },
    emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});

export default PeopleScreen;
