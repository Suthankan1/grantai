package com.grantai.dto;

public record AuthResponse(
    UserDto user,
    String token,
    String refreshToken,
    String message
) {}
