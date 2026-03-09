package com.taskio.service;

import com.taskio.dto.request.RegisterRequest;
import com.taskio.dto.request.LoginRequest;
import com.taskio.dto.response.AuthResponse;
import com.taskio.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void forgotPassword(String email);

    UserResponse getProfile(Long userId);

    UserResponse updateProfile(Long userId, UserResponse dto);
}
