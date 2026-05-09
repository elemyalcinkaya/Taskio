import api from './api';
import { ENDPOINTS } from '../constants/api';

export const followService = {
    searchUsers: async (userId, query) => {
        const res = await api.get(ENDPOINTS.SEARCH_USERS, { params: { userId, query } });
        return res.data;
    },

    follow: async (userId, targetId) => {
        await api.post(ENDPOINTS.FOLLOW_USER(targetId), {}, { params: { userId } });
    },

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
};
