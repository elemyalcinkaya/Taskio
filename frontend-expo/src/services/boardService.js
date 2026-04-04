import api from './api';
import { ENDPOINTS } from '../constants/api';

export const boardService = {
    getBoards: async (userId) => {
        const response = await api.get(ENDPOINTS.GET_BOARDS, { params: { userId } });
        return response.data;
    },

    createBoard: async (boardData, userId) => {
        const response = await api.post(ENDPOINTS.CREATE_BOARD, boardData, { params: { userId } });
        return response.data;
    },

    getBoard: async (id) => {
        const response = await api.get(ENDPOINTS.GET_BOARD(id));
        return response.data;
    },

    updateBoard: async (id, boardData, userId) => {
        const response = await api.put(ENDPOINTS.UPDATE_BOARD(id), boardData, { params: { userId } });
        return response.data;
    },

    addMember: async (boardId, memberUserId, requesterUserId) => {
        const response = await api.post(
            ENDPOINTS.ADD_BOARD_MEMBER(boardId),
            { userId: memberUserId },
            { params: { userId: requesterUserId } },
        );
        return response.data;
    },
};
