package com.taskio.dto.request;

import com.taskio.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Görev başlığı boş bırakılamaz")
    private String title;

    private String description;

    @NotNull(message = "Pano seçilmelidir")
    private Long boardId;

    private Task.TaskStatus status = Task.TaskStatus.TODO;

    private Task.Priority priority = Task.Priority.MEDIUM;

    private List<Long> assigneeIds; // Atanacak kullanıcıların id listesi

    private List<Long> labelIds; // Eklenecek etiketlerin id listesi

    private LocalDateTime dueDate;
}
