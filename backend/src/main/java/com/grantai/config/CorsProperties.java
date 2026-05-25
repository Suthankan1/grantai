package com.grantai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

@ConfigurationProperties(prefix = "cors")
public record CorsProperties(
    List<String> allowedOrigins
) {
    public CorsProperties {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            String envOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
            if (envOrigins != null && !envOrigins.isBlank()) {
                allowedOrigins = Arrays.stream(envOrigins.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();
            } else {
                allowedOrigins = List.of();
            }
        } else {
            allowedOrigins = allowedOrigins.stream()
                    .flatMap(origin -> Arrays.stream(origin.split(",")))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }
}
