package com.taskio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role; // "Product Designer", "Developer" vb.
    private String avatarUrl;
    private boolean active;

    // Profil sayfası için istatistikler
    private int completedTasks; // Tamamlanan görev sayısı
    private int activeTasks; // Aktif görev sayısı
    private int boardCount; // Dahil olunan pano sayısı
}
