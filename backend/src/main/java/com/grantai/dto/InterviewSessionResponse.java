package com.grantai.dto;

import java.time.Instant;

public record InterviewSessionResponse(
    String id,
    String grantId,
    String grantTitle,
    String grantProvider,
    String questionsJson,
    String answersJson,
    String feedbackJson,
    Double avgScore,
    Instant createdAt
) {}
