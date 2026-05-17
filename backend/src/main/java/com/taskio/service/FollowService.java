package com.taskio.service;

import com.taskio.dto.response.FollowRequestResponse;
import com.taskio.dto.response.UserResponse;
import java.util.List;

public interface FollowService {
    void follow(Long followerId, Long followingId);
    void unfollow(Long followerId, Long followingId);
    void approveFollow(Long followId, Long currentUserId);
    void rejectFollow(Long followId, Long currentUserId);
    List<UserResponse> getFollowing(Long userId);      // Sadece ben takip ettim ACCEPTED
    List<UserResponse> getFollowers(Long userId);      // Beni takip eden ACCEPTED
    List<UserResponse> getConnections(Long userId);    // Her iki yönden bağlantılar (görev atama için)
    List<FollowRequestResponse> getPendingRequests(Long userId);
    List<UserResponse> searchUsers(Long currentUserId, String query);
}

