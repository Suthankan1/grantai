package com.grantai.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record CoverLetterResponse(
    String id,
    String grantId,
    String grantTitle,
    String grantProvider,
    BigDecimal grantAmount,
    String grantCurrency,
    LocalDate grantDeadline,
    String grantDescription,
    String tone,
    String length,
    List<String> emphasis,
    String regenerationStyle,
    String customPrompt,
    String content,
    String status,
    boolean addToTracker,
    Instant createdAt,
    Instant updatedAt
) {}
