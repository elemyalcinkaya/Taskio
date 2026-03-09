package com.taskio.service.impl;

import com.taskio.dto.request.RegisterRequest;
import com.taskio.dto.request.LoginRequest;
import com.taskio.dto.response.AuthResponse;
import com.taskio.dto.response.UserResponse;
import com.taskio.entity.User;
import com.taskio.exception.BadRequestException;
import com.taskio.exception.ResourceNotFoundException;
import com.taskio.repository.UserRepository;
import com.taskio.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // TODO: JwtService inject edilecek

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Bu e-posta adresi zaten kullanımda.");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();
        userRepository.save(user);

        // TODO: gerçek JWT token üretimi
        return AuthResponse.builder()
                .token("jwt-token-placeholder")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Geçersiz e-posta veya şifre."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Geçersiz e-posta veya şifre.");
        }

        // TODO: gerçek JWT token üretimi
        return AuthResponse.builder()
                .token("jwt-token-placeholder")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    public void forgotPassword(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
        // TODO: E-posta gönderme servisi implement edilecek
    }

    @Override
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UserResponse dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
        if (dto.getName() != null)
            user.setName(dto.getName());
        if (dto.getRole() != null)
            user.setRole(dto.getRole());
        if (dto.getAvatarUrl() != null)
            user.setAvatarUrl(dto.getAvatarUrl());
        userRepository.save(user);
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
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
