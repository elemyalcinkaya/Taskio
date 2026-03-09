package com.taskio.service;

import com.taskio.dto.request.CreateTaskRequest;
import com.taskio.dto.request.UpdateTaskRequest;
import com.taskio.dto.request.UpdateStatusRequest;
import com.taskio.dto.response.TaskResponse;
import java.util.List;

public interface TaskService {
    List<TaskResponse> getTasksByBoard(Long boardId);

    TaskResponse createTask(Long creatorId, CreateTaskRequest request);

    TaskResponse getTask(Long taskId);

    TaskResponse updateTask(Long taskId, Long userId, UpdateTaskRequest request);

    void deleteTask(Long taskId, Long userId);

    TaskResponse updateStatus(Long taskId, Long userId, UpdateStatusRequest request);

    void assignUser(Long taskId, Long targetUserId, Long requesterId);
}
