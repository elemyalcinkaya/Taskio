import api from './api';
import { ENDPOINTS } from '../constants/api';
import { normalizeTaskForUi, uiStatusToApi } from '../utils/taskStatus';

const mapTaskList = (data) => (Array.isArray(data) ? data : []).map(normalizeTaskForUi);

export const taskService = {
    getTasks: async (boardId) => {
        const response = await api.get(ENDPOINTS.GET_TASKS(boardId));
        return mapTaskList(response.data);
    },

    createTask: async (taskData, userId) => {
        const response = await api.post(ENDPOINTS.CREATE_TASK, taskData, { params: { userId } });
        return normalizeTaskForUi(response.data);
    },

    getTask: async (id) => {
        const response = await api.get(ENDPOINTS.GET_TASK(id));
        return normalizeTaskForUi(response.data);
    },

    updateTask: async (id, taskData, userId) => {
        const response = await api.put(ENDPOINTS.UPDATE_TASK(id), taskData, { params: { userId } });
        return normalizeTaskForUi(response.data);
    },

    deleteTask: async (id, userId) => {
        await api.delete(ENDPOINTS.DELETE_TASK(id), { params: { userId } });
    },

    /** uiStatus: e.g. "To Do" — converted to API enum for Spring */
    updateStatus: async (id, uiStatus, userId) => {
        const response = await api.patch(
            ENDPOINTS.UPDATE_TASK_STATUS(id),
            { status: uiStatusToApi(uiStatus) },
            { params: { userId } },
        );
        return normalizeTaskForUi(response.data);
    },

    assignUser: async (taskId, targetUserId, userId) => {
        await api.post(ENDPOINTS.ASSIGN_USER(taskId), {}, { params: { targetUserId, userId } });
    },

    // Kullanıcıya ait veya atandığı tüm görevler
    getTasksByUser: async (userId) => {
        const response = await api.get(ENDPOINTS.GET_USER_TASKS, { params: { userId } });
        return mapTaskList(response.data);
    },
};
