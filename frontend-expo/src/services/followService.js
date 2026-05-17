import api from './api';
import { ENDPOINTS } from '../constants/api';

export const followService = {
    searchUsers: async (userId, query) => {
        const res = await api.get(ENDPOINTS.SEARCH_USERS, { params: { userId, query } });
        return res.data;
    },

    // Bağlantı isteği gönder
    follow: async (userId, targetId) => {
        await api.post(ENDPOINTS.FOLLOW_USER(targetId), {}, { params: { userId } });
    },

    // Bağlantı isteğini geri çek veya bağlantıyı kes
    unfollow: async (userId, targetId) => {
        await api.delete(ENDPOINTS.FOLLOW_USER(targetId), { params: { userId } });
    },

    getFollowing: async (userId) => {
        const res = await api.get(ENDPOINTS.GET_FOLLOWING(userId));
        return res.data;
    },

    getFollowers: async (userId) => {
        const res = await api.get(ENDPOINTS.GET_FOLLOWERS(userId));
        return res.data;
    },

    // Her iki yönden onaylanmış bağlantılar (görev atama için kullanılır)
    getConnections: async (userId) => {
        const res = await api.get(ENDPOINTS.GET_CONNECTIONS(userId));
        return res.data;
    },

    // Gelen onay bekleyen istekler
    getFollowRequests: async (userId) => {
        const res = await api.get(ENDPOINTS.GET_FOLLOW_REQUESTS, { params: { userId } });
        return res.data;
    },

    // Kabul et
    approveFollow: async (followId, userId) => {
        await api.post(ENDPOINTS.APPROVE_FOLLOW(followId), {}, { params: { userId } });
    },

    // Reddet
    rejectFollow: async (followId, userId) => {
        await api.delete(ENDPOINTS.APPROVE_FOLLOW(followId), { params: { userId } });
    },
};

