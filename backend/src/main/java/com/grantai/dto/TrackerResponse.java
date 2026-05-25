package com.grantai.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TrackerResponse(
    String id,
    String grantId,
    String grantTitle,
    String grantProvider,
    BigDecimal grantAmount,
    String grantCurrency,
    LocalDate grantDeadline,
    String status,
    LocalDate appliedDate,
    String notes,
    String coverLetterStatus, // "READY", "GENERATING", "SAVED", "FAILED", or "None"
    String coverLetterId,     // ID of the cover letter if one exists
    Instant createdAt,
    Instant updatedAt,
    boolean bookmarked
) {}
