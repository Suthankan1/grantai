package com.grantai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SaveSessionRequest(
    @NotBlank String grantId,
    @NotBlank String questionsJson,
    @NotBlank String answersJson,
    @NotBlank String feedbackJson,
    @NotNull Double avgScore
) {}
