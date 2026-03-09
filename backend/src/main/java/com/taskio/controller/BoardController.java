package com.taskio.controller;

import com.taskio.dto.request.CreateBoardRequest;
import com.taskio.dto.request.UpdateBoardRequest;
import com.taskio.dto.request.AddMemberRequest;
import com.taskio.dto.response.BoardResponse;
import com.taskio.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // GET /api/boards
    @GetMapping
    public ResponseEntity<List<BoardResponse>> getBoards(
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        return ResponseEntity.ok(boardService.getBoardsByUser(userId));
    }

    // POST /api/boards
    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(
            @Valid @RequestBody CreateBoardRequest request,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(boardService.createBoard(userId, request));
    }

    // GET /api/boards/{boardId}
    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponse> getBoard(
            @PathVariable Long boardId) {
        return ResponseEntity.ok(boardService.getBoard(boardId));
    }

    // PUT /api/boards/{boardId}
    @PutMapping("/{boardId}")
    public ResponseEntity<BoardResponse> updateBoard(
            @PathVariable Long boardId,
            @Valid @RequestBody UpdateBoardRequest request,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        return ResponseEntity.ok(boardService.updateBoard(boardId, userId, request));
    }

    // POST /api/boards/{boardId}/members
    @PostMapping("/{boardId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable Long boardId,
            @Valid @RequestBody AddMemberRequest request,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        boardService.addMember(boardId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
