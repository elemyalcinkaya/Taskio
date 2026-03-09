package com.taskio.controller;

import com.taskio.dto.request.CreateTaskRequest;
import com.taskio.dto.request.UpdateTaskRequest;
import com.taskio.dto.request.UpdateStatusRequest;
import com.taskio.dto.response.TaskResponse;
import com.taskio.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // GET /api/tasks/board/{boardId}
    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<TaskResponse>> getTasksByBoard(
            @PathVariable Long boardId) {
        return ResponseEntity.ok(taskService.getTasksByBoard(boardId));
    }

    // POST /api/tasks
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(userId, request));
    }

    // GET /api/tasks/{taskId}
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTask(taskId));
    }

    // PUT /api/tasks/{taskId}
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        return ResponseEntity.ok(taskService.updateTask(taskId, userId, request));
    }

    // DELETE /api/tasks/{taskId}
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long taskId,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        taskService.deleteTask(taskId, userId);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/tasks/{taskId}/status
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateStatusRequest request,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        return ResponseEntity.ok(taskService.updateStatus(taskId, userId, request));
    }

    // POST /api/tasks/{taskId}/assignees
    @PostMapping("/{taskId}/assignees")
    public ResponseEntity<Void> assignUser(
            @PathVariable Long taskId,
            @RequestParam Long targetUserId,
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        taskService.assignUser(taskId, targetUserId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
