package com.grantai.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for POST /api/auth/google.
 * The frontend sends the raw Google ID token returned by the Google OAuth popup.
 */
public record GoogleAuthRequest(
    @NotBlank(message = "Google ID token is required.")
    String idToken
) {}
