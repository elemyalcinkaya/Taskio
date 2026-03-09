package com.taskio.dto.request;

import com.taskio.entity.Task;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotNull(message = "Durum boş bırakılamaz")
    private Task.TaskStatus status; // TODO, IN_PROGRESS, REVIEW, DONE
}
