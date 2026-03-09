// API Endpoint Sabitleri
export const BASE_URL = 'http://10.0.2.2:8080/api'; // Android Emulator için localhost

export const ENDPOINTS = {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',

    // Users
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',

    // Boards
    GET_BOARDS: '/boards',
    CREATE_BOARD: '/boards',
    GET_BOARD: (id) => `/boards/${id}`,
    UPDATE_BOARD: (id) => `/boards/${id}`,
    ADD_BOARD_MEMBER: (id) => `/boards/${id}/members`,

    // Tasks
    GET_TASKS: (boardId) => `/boards/${boardId}/tasks`,
    CREATE_TASK: '/tasks',
    GET_TASK: (id) => `/tasks/${id}`,
    UPDATE_TASK: (id) => `/tasks/${id}`,
    DELETE_TASK: (id) => `/tasks/${id}`,
    UPDATE_TASK_STATUS: (id) => `/tasks/${id}/status`,
    ASSIGN_USER: (id) => `/tasks/${id}/assignees`,

    // Labels
    GET_LABELS: '/labels',
    ADD_TASK_LABEL: (taskId) => `/tasks/${taskId}/labels`,

    // Comments
    GET_COMMENTS: (taskId) => `/tasks/${taskId}/comments`,
    ADD_COMMENT: (taskId) => `/tasks/${taskId}/comments`,
};
