package com.grantai.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record TrackerCreateRequest(
    @NotBlank String grantId,
    String status,
    String notes,
    LocalDate appliedDate
) {}
