package com.grantai.dto;

import java.time.LocalDate;

public record TrackerUpdateRequest(
    String status,
    String notes,
    LocalDate appliedDate
) {}
