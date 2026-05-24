package com.grantai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
    String secret,
    long accessTokenExpiryMs,
    long refreshTokenExpiryMs,
    String cookieDomain,
    boolean secureCookie
) {}
