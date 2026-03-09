package com.taskio.service.impl;

import com.taskio.dto.request.CreateTaskRequest;
import com.taskio.dto.request.UpdateTaskRequest;
import com.taskio.dto.request.UpdateStatusRequest;
import com.taskio.dto.response.TaskResponse;
import com.taskio.dto.response.UserResponse;
import com.taskio.entity.*;
import com.taskio.exception.ResourceNotFoundException;
import com.taskio.repository.*;
import com.taskio.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

        private final TaskRepository taskRepository;
        private final BoardRepository boardRepository;
        private final UserRepository userRepository;
        private final LabelRepository labelRepository;

        @Override
        public List<TaskResponse> getTasksByBoard(Long boardId) {
                return taskRepository.findByBoardId(boardId)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public TaskResponse createTask(Long creatorId, CreateTaskRequest request) {
                Board board = boardRepository.findById(request.getBoardId())
                                .orElseThrow(() -> new ResourceNotFoundException("Pano bulunamadı."));
                User creator = userRepository.findById(creatorId)
                                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));

                Task task = Task.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .status(request.getStatus())
                                .priority(request.getPriority())
                                .board(board)
                                .creator(creator)
                                .dueDate(request.getDueDate())
                                .build();
                taskRepository.save(task);
                return mapToResponse(task);
        }

        @Override
        public TaskResponse getTask(Long taskId) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı."));
                return mapToResponse(task);
        }

        @Override
        @Transactional
        public TaskResponse updateTask(Long taskId, Long userId, UpdateTaskRequest request) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı."));
                if (request.getTitle() != null)
                        task.setTitle(request.getTitle());
                if (request.getDescription() != null)
                        task.setDescription(request.getDescription());
                if (request.getStatus() != null)
                        task.setStatus(request.getStatus());
                if (request.getPriority() != null)
                        task.setPriority(request.getPriority());
                if (request.getDueDate() != null)
                        task.setDueDate(request.getDueDate());
                taskRepository.save(task);
                return mapToResponse(task);
        }

        @Override
        @Transactional
        public void deleteTask(Long taskId, Long userId) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı."));
                taskRepository.delete(task);
        }

        @Override
        @Transactional
        public TaskResponse updateStatus(Long taskId, Long userId, UpdateStatusRequest request) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı."));
                task.setStatus(request.getStatus());
                taskRepository.save(task);
                return mapToResponse(task);
        }

        @Override
        @Transactional
        public void assignUser(Long taskId, Long targetUserId, Long requesterId) {
                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı."));
                User user = userRepository.findById(targetUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
                TaskAssignee assignee = TaskAssignee.builder()
                                .task(task)
                                .user(user)
                                .build();
                // TODO: TaskAssigneeRepository inject edilip kayıt yapılacak
        }

        private TaskResponse mapToResponse(Task task) {
                return TaskResponse.builder()
                                .id(task.getId())
                                .title(task.getTitle())
                                .description(task.getDescription())
                                .status(task.getStatus() != null ? task.getStatus().name() : null)
                                .priority(task.getPriority() != null ? task.getPriority().name() : null)
                                .boardId(task.getBoard() != null ? task.getBoard().getId() : null)
                                .boardName(task.getBoard() != null ? task.getBoard().getName() : null)
                                .creator(task.getCreator() != null ? mapUser(task.getCreator()) : null)
                                .dueDate(task.getDueDate())
                                .createdAt(task.getCreatedAt())
                                .updatedAt(task.getUpdatedAt())
                                .build();
        }

        private UserResponse mapUser(User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .build();
        }
}
