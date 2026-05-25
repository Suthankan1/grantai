package com.grantai.dto;

public record UserDto(
    String id,
    String email,
    String fullName,
    String role,
    boolean profileComplete,
    String profilePhotoUrl
) {}
