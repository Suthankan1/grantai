package com.grantai.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CoverLetterGenerateRequest(
    @NotBlank(message = "grantId is required")
    String grantId,
    String tone,
    String length,
    List<String> emphasis,
    String regenerationStyle,
    String customPrompt
) {}
