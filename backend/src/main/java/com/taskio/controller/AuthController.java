package com.taskio.controller;

import com.taskio.dto.request.RegisterRequest;
import com.taskio.dto.request.LoginRequest;
import com.taskio.dto.request.ForgotPasswordRequest;
import com.taskio.dto.response.AuthResponse;
import com.taskio.dto.response.UserResponse;
import com.taskio.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok().build();
    }

    // GET /api/users/profile
    @GetMapping("/users/profile")
    public ResponseEntity<UserResponse> getProfile(
            @RequestParam Long userId) { // TODO: JWT'den alınacak
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    // PUT /api/users/profile
    @PutMapping("/users/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestParam Long userId,
            @RequestBody UserResponse dto) { // TODO: JWT'den alınacak
        return ResponseEntity.ok(authService.updateProfile(userId, dto));
    }
}
