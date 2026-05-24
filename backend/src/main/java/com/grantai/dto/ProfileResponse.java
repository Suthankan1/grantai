package com.grantai.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProfileResponse(
    String userId,
    String email,
    String fullName,
    String country,
    String profilePhotoUrl,
    String university,
    String degreeLevel,
    String fieldOfStudy,
    Integer graduationYear,
    BigDecimal gpa,
    List<String> researchInterests,
    List<String> grantTypes,
    List<String> preferredCountries,
    Integer minGrantAmount,
    String deadlinePreference,
    boolean profileComplete
) {}