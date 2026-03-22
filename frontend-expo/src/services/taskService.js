import api from './api';
import { ENDPOINTS } from '../constants/api';

export const taskService = {
    // Board'a göre görevleri listele
    getTasks: async (boardId) => {
        const response = await api.get(ENDPOINTS.GET_TASKS(boardId));
        return response.data;
    },

    // Görev oluştur
    createTask: async (taskData) => {
        const response = await api.post(ENDPOINTS.CREATE_TASK, taskData);
        return response.data;
    },

    // Görev detayı
    getTask: async (id) => {
        const response = await api.get(ENDPOINTS.GET_TASK(id));
        return response.data;
    },

    // Görev güncelle
    updateTask: async (id, taskData) => {
        const response = await api.put(ENDPOINTS.UPDATE_TASK(id), taskData);
        return response.data;
    },

    // Görev sil
    deleteTask: async (id) => {
        const response = await api.delete(ENDPOINTS.DELETE_TASK(id));
        return response.data;
    },

    // Görev durumunu güncelle
    updateStatus: async (id, status) => {
        const response = await api.patch(ENDPOINTS.UPDATE_TASK_STATUS(id), { status });
        return response.data;
    },

    // Göreve kullanıcı ata
    assignUser: async (taskId, userId) => {
        const response = await api.post(ENDPOINTS.ASSIGN_USER(taskId), { userId });
        return response.data;
    },
};
