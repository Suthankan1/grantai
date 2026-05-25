package com.grantai.controller;

import com.grantai.dto.AuthResponse;
import com.grantai.dto.GoogleAuthRequest;
import com.grantai.dto.LoginRequest;
import com.grantai.dto.RegisterRequest;
import com.grantai.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Hash password with BCrypt, return JWT + refreshToken as httpOnly cookies.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request,
        HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.register(request, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    /**
     * POST /api/auth/login
     * Validate credentials, return JWT + refreshToken as httpOnly cookies.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * POST /api/auth/refresh
     * Use refresh token cookie to issue new access token (token rotation).
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.refresh(request, response);
        return ResponseEntity.ok(authResponse);
    }

    /**
     * POST /api/auth/logout
     * Revoke refresh tokens and clear httpOnly cookies.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        authService.logout(request, response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
    /**
     * POST /api/auth/google
     * Verify a Google ID token, find-or-create the user, and return JWT cookies.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(
        @Valid @RequestBody GoogleAuthRequest request,
        HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.googleAuth(request, response);
        return ResponseEntity.ok(authResponse);
    }
}
