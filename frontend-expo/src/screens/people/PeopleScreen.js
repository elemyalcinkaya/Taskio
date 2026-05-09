import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TextInput,
    FlatList, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { followService } from '../../services/followService';

const PeopleScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [following, setFollowing] = useState([]);
    const [tab, setTab] = useState('search'); // 'search' | 'following'
    const [loading, setLoading] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);

    useEffect(() => {
        loadFollowing();
    }, []);

    const loadFollowing = async () => {
        if (!user?.id) return;
        setFollowingLoading(true);
        try {
            const data = await followService.getFollowing(user.id);
            setFollowing(data);
        } catch (e) {
            console.error('Following load error:', e);
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleSearch = useCallback(async (q) => {
        setSearchQuery(q);
        if (q.trim().length < 2) {
            setSearchResults([]);
            return;
        }
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
                await followService.unfollow(user.id, targetUser.id);
                setSearchResults(prev =>
                    prev.map(u => u.id === targetUser.id ? { ...u, isFollowing: false } : u)
                );
                setFollowing(prev => prev.filter(u => u.id !== targetUser.id));
            } else {
                await followService.follow(user.id, targetUser.id);
                setSearchResults(prev =>
                    prev.map(u => u.id === targetUser.id ? { ...u, isFollowing: true } : u)
                );
                setFollowing(prev => [...prev, { ...targetUser, isFollowing: true }]);
            }
        } catch (e) {
            const msg = e.response?.data?.message || 'Bir hata oluştu.';
            Alert.alert('Hata', msg);
        }
    };

    const handleUnfollowFromList = async (targetUser) => {
        try {
            await followService.unfollow(user.id, targetUser.id);
            setFollowing(prev => prev.filter(u => u.id !== targetUser.id));
            setSearchResults(prev =>
                prev.map(u => u.id === targetUser.id ? { ...u, isFollowing: false } : u)
            );
        } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || 'Takip bırakılamadı.');
        }
    };

    const renderUserCard = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {(item.name || 'U').charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>{item.role || item.email}</Text>
            </View>
            <TouchableOpacity
                style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
                onPress={() => handleFollow(item)}
            >
                <Text style={[styles.followBtnText, item.isFollowing && styles.followingBtnText]}>
                    {item.isFollowing ? 'Takipte' : 'Takip Et'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderFollowingCard = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {(item.name || 'U').charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>{item.role || item.email}</Text>
            </View>
            <TouchableOpacity
                style={styles.unfollowBtn}
                onPress={() => handleUnfollowFromList(item)}
            >
                <Feather name="user-minus" size={16} color="#EF4444" />
            </TouchableOpacity>
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
                    <Feather name="search" size={15} color={tab === 'search' ? COLORS.primary : COLORS.textMuted} />
                    <Text style={[styles.tabText, tab === 'search' && styles.activeTabText]}>Ara</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'following' && styles.activeTab]}
                    onPress={() => setTab('following')}
                >
                    <Feather name="users" size={15} color={tab === 'following' ? COLORS.primary : COLORS.textMuted} />
                    <Text style={[styles.tabText, tab === 'following' && styles.activeTabText]}>
                        Takip Edilenler {following.length > 0 ? `(${following.length})` : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            {tab === 'search' ? (
                <View style={{ flex: 1 }}>
                    {/* Search Input */}
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
                            renderItem={renderUserCard}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {followingLoading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : following.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Feather name="users" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>Henüz kimseyi takip etmiyorsunuz</Text>
                            <Text style={styles.emptySubtitle}>Ara sekmesinden kullanıcı bulabilirsin</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={following}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderFollowingCard}
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 12,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 4,
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 10,
    },
    activeTab: { backgroundColor: COLORS.background },
    tabText: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
    activeTabText: { color: COLORS.primary, fontWeight: '700' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    userInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    userRole: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    followBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    followBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    followingBtnText: { color: COLORS.primary },
    unfollowBtn: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#EF444415',
        borderWidth: 1,
        borderColor: '#EF444440',
    },
    emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
    emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.textSecondary },
    emptySubtitle: { fontSize: 13, color: COLORS.textMuted },
});

export default PeopleScreen;
