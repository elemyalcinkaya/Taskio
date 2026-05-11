package com.taskio.controller;

import com.taskio.dto.response.FollowRequestResponse;
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

    // GET /api/users/follow-requests?userId=  → Gelen onay bekleyen istekler
    @GetMapping("/follow-requests")
    public ResponseEntity<List<FollowRequestResponse>> getPendingRequests(
            @RequestParam Long userId) {
        return ResponseEntity.ok(followService.getPendingRequests(userId));
    }

    // POST /api/users/{targetId}/follow?userId=  → Takip isteği gönder
    @PostMapping("/{targetId}/follow")
    public ResponseEntity<Void> follow(
            @PathVariable Long targetId,
            @RequestParam Long userId) {
        followService.follow(userId, targetId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/users/{targetId}/follow?userId=  → Takibi/isteği geri al
    @DeleteMapping("/{targetId}/follow")
    public ResponseEntity<Void> unfollow(
            @PathVariable Long targetId,
            @RequestParam Long userId) {
        followService.unfollow(userId, targetId);
        return ResponseEntity.ok().build();
    }

    // POST /api/users/follow-requests/{followId}/approve?userId=  → Kabul et
    @PostMapping("/follow-requests/{followId}/approve")
    public ResponseEntity<Void> approveFollow(
            @PathVariable Long followId,
            @RequestParam Long userId) {
        followService.approveFollow(followId, userId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/users/follow-requests/{followId}/approve?userId=  → Reddet
    @DeleteMapping("/follow-requests/{followId}/approve")
    public ResponseEntity<Void> rejectFollow(
            @PathVariable Long followId,
            @RequestParam Long userId) {
        followService.rejectFollow(followId, userId);
        return ResponseEntity.ok().build();
    }

    // GET /api/users/{userId}/following  → Kabul edilmiş takip edilenler
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserResponse>> getFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    // GET /api/users/{userId}/followers  → Kabul edilmiş takipçiler
    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserResponse>> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }
}
