package com.taskio.dto.request;

import com.taskio.entity.Task;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateTaskRequest {

    private String title; // Opsiyonel
    private String description; // Opsiyonel
    private Task.TaskStatus status; // Opsiyonel
    private Task.Priority priority; // Opsiyonel
    private List<Long> assigneeIds; // Opsiyonel
    private List<Long> labelIds; // Opsiyonel
    private LocalDateTime dueDate; // Opsiyonel
}
