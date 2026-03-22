import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, SafeAreaView,
    TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { boardService } from '../../services/boardService';

const BoardsScreen = ({ navigation }) => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadBoards();
    }, []);

    const loadBoards = async () => {
        try {
            const data = await boardService.getBoards();
            setBoards(data);
        } catch (error) {
            console.error('Boards load error:', error);
        } finally {
            setLoading(false);
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
                <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Pano</Text>
                </TouchableOpacity>
            </View>

            {/* Arama */}
            <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pano ara..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

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
    searchIcon: { fontSize: 16, marginRight: 8 },
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
});

export default BoardsScreen;
