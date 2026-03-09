package com.taskio.service;

import com.taskio.dto.request.CreateBoardRequest;
import com.taskio.dto.request.UpdateBoardRequest;
import com.taskio.dto.request.AddMemberRequest;
import com.taskio.dto.response.BoardResponse;
import java.util.List;

public interface BoardService {
    List<BoardResponse> getBoardsByUser(Long userId);

    BoardResponse createBoard(Long userId, CreateBoardRequest request);

    BoardResponse getBoard(Long boardId);

    BoardResponse updateBoard(Long boardId, Long userId, UpdateBoardRequest request);

    void addMember(Long boardId, Long userId, AddMemberRequest request);
}
