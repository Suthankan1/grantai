package com.grantai.dto;

public record CoverLetterUpdateRequest(
    String content,
    Boolean addToTracker
) {}
