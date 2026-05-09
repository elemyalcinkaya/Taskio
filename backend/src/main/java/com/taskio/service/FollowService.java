package com.taskio.service;

import com.taskio.dto.response.UserResponse;
import java.util.List;

public interface FollowService {
    void follow(Long followerId, Long followingId);
    void unfollow(Long followerId, Long followingId);
    List<UserResponse> getFollowing(Long userId);
    List<UserResponse> getFollowers(Long userId);
    List<UserResponse> searchUsers(Long currentUserId, String query);
}
