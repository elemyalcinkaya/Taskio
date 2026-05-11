package com.taskio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowRequestResponse {
    private Long followId;
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterRole;
    private String requesterAvatarUrl;
    private String requestedAt;
}
