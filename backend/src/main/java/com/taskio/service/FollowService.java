package com.taskio.service;

import com.taskio.dto.response.FollowRequestResponse;
import com.taskio.dto.response.UserResponse;
import java.util.List;

public interface FollowService {
    void follow(Long followerId, Long followingId);
    void unfollow(Long followerId, Long followingId);
    void approveFollow(Long followId, Long currentUserId);
    void rejectFollow(Long followId, Long currentUserId);
    List<UserResponse> getFollowing(Long userId);      // Sadece ACCEPTED
    List<UserResponse> getFollowers(Long userId);      // Sadece ACCEPTED
    List<FollowRequestResponse> getPendingRequests(Long userId);  // Onay bekleyenler
    List<UserResponse> searchUsers(Long currentUserId, String query);
}
