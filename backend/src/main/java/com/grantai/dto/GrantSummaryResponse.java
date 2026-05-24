package com.grantai.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GrantSummaryResponse(
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
    int matchScore,
    String matchReasoning,
    String sourceUrl
) {}