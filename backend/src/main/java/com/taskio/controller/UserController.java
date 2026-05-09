package com.taskio.controller;

import com.taskio.dto.response.UserResponse;
import com.taskio.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final FollowService followService;

    // GET /api/users/search?query=&userId=
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam Long userId) {
        return ResponseEntity.ok(followService.searchUsers(userId, query));
    }

    // POST /api/users/{targetId}/follow?userId=
    @PostMapping("/{targetId}/follow")
    public ResponseEntity<Void> follow(
            @PathVariable Long targetId,
            @RequestParam Long userId) {
        followService.follow(userId, targetId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/users/{targetId}/follow?userId=
    @DeleteMapping("/{targetId}/follow")
    public ResponseEntity<Void> unfollow(
            @PathVariable Long targetId,
            @RequestParam Long userId) {
        followService.unfollow(userId, targetId);
        return ResponseEntity.ok().build();
    }

    // GET /api/users/{userId}/following
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserResponse>> getFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    // GET /api/users/{userId}/followers
    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserResponse>> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }
}
