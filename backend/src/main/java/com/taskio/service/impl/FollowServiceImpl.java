package com.taskio.service.impl;

import com.taskio.dto.response.FollowRequestResponse;
import com.taskio.dto.response.UserResponse;
import com.taskio.entity.Follow;
import com.taskio.entity.Follow.FollowStatus;
import com.taskio.entity.User;
import com.taskio.exception.BadRequestException;
import com.taskio.exception.ResourceNotFoundException;
import com.taskio.repository.FollowRepository;
import com.taskio.repository.UserRepository;
import com.taskio.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new BadRequestException("Kendinizi takip edemezsiniz.");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new BadRequestException("Bu kullanıcıya zaten istek gönderilmiş veya takip ediyorsunuz.");
        }
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Takip edilecek kullanıcı bulunamadı."));

        followRepository.save(Follow.builder()
                .follower(follower)
                .following(following)
                .status(FollowStatus.PENDING)
                .build());
    }

    @Override
    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Takip ilişkisi bulunamadı."));
        followRepository.delete(follow);
    }

    @Override
    @Transactional
    public void approveFollow(Long followId, Long currentUserId) {
        Follow follow = followRepository.findByIdAndFollowingId(followId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("İstek bulunamadı."));
        if (follow.getStatus() != FollowStatus.PENDING) {
            throw new BadRequestException("Bu istek zaten işleme alınmış.");
        }
        // İsteği onayla
        follow.setStatus(FollowStatus.ACCEPTED);
        followRepository.save(follow);

        // Ters yönde bağlantı yoksa otomatik oluştur (çift yönlü bağlantı mantığı)
        Long requesterId = follow.getFollower().getId();
        boolean reverseExists = followRepository.existsByFollowerIdAndFollowingId(currentUserId, requesterId);
        if (!reverseExists) {
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
            followRepository.save(Follow.builder()
                    .follower(currentUser)
                    .following(follow.getFollower())
                    .status(FollowStatus.ACCEPTED)
                    .build());
        }
    }

    @Override
    @Transactional
    public void rejectFollow(Long followId, Long currentUserId) {
        Follow follow = followRepository.findByIdAndFollowingId(followId, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("İstek bulunamadı."));
        followRepository.delete(follow);
    }

    @Override
    public List<UserResponse> getFollowing(Long userId) {
        return followRepository.findAcceptedFollowingByUserId(userId)
                .stream()
                .map(u -> mapToResponse(u, true))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getFollowers(Long userId) {
        return followRepository.findAcceptedFollowersByUserId(userId)
                .stream()
                .map(u -> mapToResponse(u, true))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getConnections(Long userId) {
        // Her iki yönden ACCEPTED bağlantıları (görev atama için kullanılır)
        return followRepository.findConnectionsByUserId(userId)
                .stream()
                .map(u -> mapToResponse(u, true))
                .collect(Collectors.toList());
    }

    @Override
    public List<FollowRequestResponse> getPendingRequests(Long userId) {
        return followRepository.findPendingRequestsForUser(userId)
                .stream()
                .map(f -> FollowRequestResponse.builder()
                        .followId(f.getId())
                        .requesterId(f.getFollower().getId())
                        .requesterName(f.getFollower().getName())
                        .requesterEmail(f.getFollower().getEmail())
                        .requesterRole(f.getFollower().getRole())
                        .requesterAvatarUrl(f.getFollower().getAvatarUrl())
                        .requestedAt(f.getCreatedAt() != null ? f.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> searchUsers(Long currentUserId, String query) {
        return userRepository.searchUsers(query)
                .stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .map(u -> {
                    boolean accepted = followRepository.findByFollowerIdAndFollowingId(currentUserId, u.getId())
                            .map(f -> f.getStatus() == FollowStatus.ACCEPTED)
                            .orElse(false);
                    boolean pending = followRepository.findByFollowerIdAndFollowingId(currentUserId, u.getId())
                            .map(f -> f.getStatus() == FollowStatus.PENDING)
                            .orElse(false);
                    UserResponse r = mapToResponse(u, accepted);
                    r.setPending(pending);
                    return r;
                })
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user, boolean isFollowing) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .isFollowing(isFollowing)
                .build();
    }
}
