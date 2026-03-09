package com.taskio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status; // "TODO", "IN_PROGRESS", "REVIEW", "DONE"
    private String priority; // "LOW", "MEDIUM", "HIGH", "URGENT"
    private Long boardId;
    private String boardName;
    private UserResponse creator; // Görevi oluşturan
    private List<UserResponse> assignees; // Göreve atananlar
    private List<LabelResponse> labels; // Görevin etiketleri
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
