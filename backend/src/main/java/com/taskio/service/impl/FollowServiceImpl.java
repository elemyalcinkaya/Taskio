package com.taskio.service.impl;

import com.taskio.dto.response.UserResponse;
import com.taskio.entity.Follow;
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
            throw new BadRequestException("Bu kullanıcıyı zaten takip ediyorsunuz.");
        }
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Takip edilecek kullanıcı bulunamadı."));

        followRepository.save(Follow.builder()
                .follower(follower)
                .following(following)
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
    public List<UserResponse> getFollowing(Long userId) {
        return followRepository.findFollowingByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getFollowers(Long userId) {
        return followRepository.findFollowersByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> searchUsers(Long currentUserId, String query) {
        return userRepository.searchUsers(query)
                .stream()
                .filter(u -> !u.getId().equals(currentUserId)) // kendini gösterme
                .map(u -> {
                    UserResponse r = mapToResponse(u);
                    r.setFollowing(followRepository.existsByFollowerIdAndFollowingId(currentUserId, u.getId()));
                    return r;
                })
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .build();
    }
}
