import { Platform } from 'react-native';

// API Endpoint Sabitleri
const IP_ADDRESS = '192.168.1.47';
export const BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || 
    (Platform.OS === 'web' ? 'http://localhost:8080/api' : `http://${IP_ADDRESS}:8080/api`);

export const ENDPOINTS = {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',

    // Users
    GET_PROFILE: '/auth/users/profile',
    UPDATE_PROFILE: '/auth/users/profile',
    SEARCH_USERS: '/users/search',
    FOLLOW_USER: (id) => `/users/${id}/follow`,
    GET_FOLLOWING: (id) => `/users/${id}/following`,
    GET_FOLLOWERS: (id) => `/users/${id}/followers`,
    GET_FOLLOW_REQUESTS: '/users/follow-requests',
    APPROVE_FOLLOW: (followId) => `/users/follow-requests/${followId}/approve`,
    GET_CONNECTIONS: (id) => `/users/${id}/connections`,

    // Boards
    GET_BOARDS: '/boards',
    CREATE_BOARD: '/boards',
    GET_BOARD: (id) => `/boards/${id}`,
    UPDATE_BOARD: (id) => `/boards/${id}`,
    ADD_BOARD_MEMBER: (id) => `/boards/${id}/members`,

    // Tasks
    GET_TASKS: (boardId) => `/tasks/board/${boardId}`,
    GET_USER_TASKS: '/tasks/user',
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
