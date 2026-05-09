import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, SafeAreaView,
    TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert,
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { boardService } from '../../services/boardService';
import { useAuth } from '../../context/AuthContext';

const BoardsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);

    // Yeni pano modal stateleri
    const [modalVisible, setModalVisible] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDesc, setNewBoardDesc] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadBoards();
    }, [user?.id]);

    const loadBoards = async () => {
        if (!user?.id) {
            setBoards([]);
            setLoading(false);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const data = await boardService.getBoards(user.id);
            setBoards(data);
        } catch (err) {
            console.error('Boards load error:', err);
            const msg = err.response?.data?.message || err.message || 'Panolar yüklenemedi.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async () => {
        if (!newBoardName.trim()) {
            Alert.alert('Hata', 'Pano adı boş olamaz.');
            return;
        }
        setCreating(true);
        try {
            await boardService.createBoard(
                { name: newBoardName.trim(), description: newBoardDesc.trim() || undefined, color: '#6C3CE1' }, 
                user.id
            );
            setModalVisible(false);
            setNewBoardName('');
            setNewBoardDesc('');
            loadBoards(); // Listeyi yenile
        } catch (err) {
            Alert.alert('Hata', err.response?.data?.message || 'Pano oluşturulamadı.');
        } finally {
            setCreating(false);
        }
    };

    const filteredBoards = boards.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()),
    );

    const BOARD_COLORS = [COLORS.primary, COLORS.secondary, '#10B981', '#EF4444', '#F59E0B', '#06B6D4'];

    const renderBoard = ({ item, index }) => (
        <TouchableOpacity
            style={[styles.boardCard, { backgroundColor: BOARD_COLORS[index % BOARD_COLORS.length] }]}
            onPress={() => navigation.navigate('BoardDetail', { boardId: item.id, boardName: item.name })}>
            <Text style={styles.boardName}>{item.name}</Text>
            <Text style={styles.boardDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.boardFooter}>
                <Text style={styles.boardMeta}>{item.taskCount || 0} görev</Text>
                <Text style={styles.boardMeta}>{item.memberCount || 0} üye</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Panolarım</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addBtnText}>+ Pano</Text>
                </TouchableOpacity>
            </View>

            {/* Arama */}
            <View style={styles.searchBar}>
                <Feather name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pano ara..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={loadBoards}>
                        <Text style={styles.retryText}>Tekrar dene</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredBoards}
                    renderItem={renderBoard}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>Henüz pano oluşturmadınız.</Text>
                        </View>
                    }
                />
            )}

            {/* Pano Ekleme Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Yeni Pano</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Feather name="x" size={24} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>PANO ADI *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: Pazarlama Kampanyası"
                                placeholderTextColor={COLORS.textMuted}
                                value={newBoardName}
                                onChangeText={setNewBoardName}
                                autoFocus
                                returnKeyType="next"
                            />

                            <Text style={styles.label}>AÇIKLAMA</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Pano hakkında kısa bir açıklama..."
                                placeholderTextColor={COLORS.textMuted}
                                value={newBoardDesc}
                                onChangeText={setNewBoardDesc}
                                multiline
                            />

                            <TouchableOpacity style={styles.modalCreateBtn} onPress={handleCreateBoard} disabled={creating}>
                                {creating ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.modalCreateBtnText}>Oluştur</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
    title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
    addBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: COLORS.text, paddingVertical: 12, fontSize: 15 },
    list: { paddingHorizontal: 12 },
    row: { justifyContent: 'space-between', marginBottom: 12 },
    boardCard: {
        width: '48%',
        borderRadius: 16,
        padding: 16,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    boardName: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
    boardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1 },
    boardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    boardMeta: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    loader: { flex: 1 },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyText: { color: COLORS.textSecondary, fontSize: 15 },
    errorBanner: {
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#EF444420',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    errorText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
    retryText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    // Modal Stilleri
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalContent: {
        backgroundColor: COLORS.surfaceLight,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textMuted,
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 12,
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
    modalCreateBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    modalCreateBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});

export default BoardsScreen;
