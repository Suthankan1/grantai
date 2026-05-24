package com.grantai.dto;

import java.util.List;

public record GrantSearchResponse(
    List<GrantSummaryResponse> items,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext
) {}