package com.taskio.service.impl;

import com.taskio.dto.request.CreateBoardRequest;
import com.taskio.dto.request.UpdateBoardRequest;
import com.taskio.dto.request.AddMemberRequest;
import com.taskio.dto.response.BoardResponse;
import com.taskio.dto.response.UserResponse;
import com.taskio.entity.Board;
import com.taskio.entity.BoardMember;
import com.taskio.entity.User;
import com.taskio.exception.BadRequestException;
import com.taskio.exception.ResourceNotFoundException;
import com.taskio.repository.BoardMemberRepository;
import com.taskio.repository.BoardRepository;
import com.taskio.repository.UserRepository;
import com.taskio.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

        private final BoardRepository boardRepository;
        private final BoardMemberRepository boardMemberRepository;
        private final UserRepository userRepository;

        @Override
        public List<BoardResponse> getBoardsByUser(Long userId) {
                return boardRepository.findAllBoardsByUserId(userId)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public BoardResponse createBoard(Long userId, CreateBoardRequest request) {
                User owner = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

                Board board = Board.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .color(request.getColor())
                                .owner(owner)
                                .build();
                boardRepository.save(board);
                return mapToResponse(board);
        }

        @Override
        public BoardResponse getBoard(Long boardId) {
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pano bulunamadı."));
                return mapToResponse(board);
        }

        @Override
        @Transactional
        public BoardResponse updateBoard(Long boardId, Long userId, UpdateBoardRequest request) {
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pano bulunamadı."));
                if (request.getName() != null)
                        board.setName(request.getName());
                if (request.getDescription() != null)
                        board.setDescription(request.getDescription());
                if (request.getColor() != null)
                        board.setColor(request.getColor());
                boardRepository.save(board);
                return mapToResponse(board);
        }

        @Override
        @Transactional
        public void addMember(Long boardId, Long userId, AddMemberRequest request) {
                Board board = boardRepository.findById(boardId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pano bulunamadı."));
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
                if (boardMemberRepository.existsByBoardIdAndUserId(boardId, request.getUserId())) {
                        throw new BadRequestException("Kullanıcı zaten pano üyesi.");
                }
                BoardMember member = BoardMember.builder()
                                .board(board)
                                .user(user)
                                .role(request.getRole())
                                .build();
                boardMemberRepository.save(member);
        }

        private BoardResponse mapToResponse(Board board) {
                return BoardResponse.builder()
                                .id(board.getId())
                                .name(board.getName())
                                .description(board.getDescription())
                                .color(board.getColor())
                                .owner(mapUser(board.getOwner()))
                                .memberCount(board.getMembers() != null ? board.getMembers().size() : 0)
                                .taskCount(board.getTasks() != null ? board.getTasks().size() : 0)
                                .createdAt(board.getCreatedAt())
                                .updatedAt(board.getUpdatedAt())
                                .build();
        }

        private UserResponse mapUser(User user) {
                if (user == null)
                        return null;
                return UserResponse.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .build();
        }
}
