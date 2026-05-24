package com.grantai.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProfileUpdateRequest(
    // Step 1
    String fullName,
    String country,
    String profilePhotoUrl,

    // Step 2
    String university,
    String degreeLevel,
    String fieldOfStudy,
    Integer graduationYear,
    BigDecimal gpa,

    // Step 3
    List<String> researchInterests,

    // Step 4
    List<String> grantTypes,
    List<String> preferredCountries,
    Integer minGrantAmount,
    String deadlinePreference
) {}
