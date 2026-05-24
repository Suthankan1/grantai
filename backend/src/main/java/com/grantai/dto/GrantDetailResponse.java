package com.grantai.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record GrantDetailResponse(
    String id,
    String title,
    String provider,
    String grantType,
    String field,
    String countryName,
    String countryCode,
    BigDecimal amount,
    String currency,
    LocalDate deadline,
    String description,
    String eligibility,
    List<String> documentsRequired,
    String timeline,
    String applicationUrl,
    String sourceUrl,
    int matchScore,
    String matchReasoning,
    Instant createdAt,
    Instant updatedAt
) {}