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
    private int completedTasks;
    private int activeTasks;
    private int boardCount;

    // Takip durumu (arama/listeleme için)
    private boolean isFollowing;
    private boolean isPending; // Onay bekleyen istek
}
