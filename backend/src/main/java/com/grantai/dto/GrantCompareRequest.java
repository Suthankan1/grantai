package com.grantai.dto;

import java.util.List;
import java.util.Map;

public record GrantCompareRequest(
    Map<String, Object> profile,
    List<String> grantIds
) {}