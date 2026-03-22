import api from './api';
import { ENDPOINTS } from '../constants/api';

export const boardService = {
    // Kullanıcının panolarını listele
    getBoards: async () => {
        const response = await api.get(ENDPOINTS.GET_BOARDS);
        return response.data;
    },

    // Pano oluştur
    createBoard: async (boardData) => {
        const response = await api.post(ENDPOINTS.CREATE_BOARD, boardData);
        return response.data;
    },

    // Pano detayını getir
    getBoard: async (id) => {
        const response = await api.get(ENDPOINTS.GET_BOARD(id));
        return response.data;
    },

    // Pano güncelle
    updateBoard: async (id, boardData) => {
        const response = await api.put(ENDPOINTS.UPDATE_BOARD(id), boardData);
        return response.data;
    },

    // Panoya üye ekle
    addMember: async (boardId, userId) => {
        const response = await api.post(ENDPOINTS.ADD_BOARD_MEMBER(boardId), { userId });
        return response.data;
    },
};
