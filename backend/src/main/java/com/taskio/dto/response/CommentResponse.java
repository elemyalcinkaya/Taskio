package com.taskio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private String content;
    private UserResponse user; // Yorumu yapan kişi
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
