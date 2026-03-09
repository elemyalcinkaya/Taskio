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
public class BoardResponse {

    private Long id;
    private String name;
    private String description;
    private String color; // Pano rengi (hex)
    private UserResponse owner; // Panoyu kim oluşturdu
    private int memberCount; // Kaç üye var
    private int taskCount; // Kaç görev var
    private List<UserResponse> members; // Üye listesi (detay sayfasında)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
