import api from './api';
import { ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    // Kullanıcı kaydı
    register: async (userData) => {
        const response = await api.post(ENDPOINTS.REGISTER, userData);
        return response.data;
    },

    // Kullanıcı girişi
    login: async (credentials) => {
        const response = await api.post(ENDPOINTS.LOGIN, credentials);
        if (response.data.token) {
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Şifremi unuttum
    forgotPassword: async (email) => {
        const response = await api.post(ENDPOINTS.FORGOT_PASSWORD, { email });
        return response.data;
    },

    // Çıkış yap
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    // Mevcut kullanıcıyı al
    getCurrentUser: async () => {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Token kontrolü
    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem('token');
        return !!token;
    },
};
