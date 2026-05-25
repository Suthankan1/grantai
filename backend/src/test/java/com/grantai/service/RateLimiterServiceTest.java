package com.grantai.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RateLimiterServiceTest {

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
    }

    @Test
    void testRateLimitAllowance() {
        String userId = "test-user-1";

        // Allow exactly 10 requests
        for (int i = 0; i < 10; i++) {
            assertTrue(rateLimiterService.isAllowed(userId), "Request " + (i + 1) + " should be allowed");
        }

        // 11th request should be blocked
        assertFalse(rateLimiterService.isAllowed(userId), "Request 11 should be blocked");
    }

    @Test
    void testRateLimitIndependentPerUser() {
        String user1 = "test-user-1";
        String user2 = "test-user-2";

        // Exhaust user1 rate limit
        for (int i = 0; i < 10; i++) {
            assertTrue(rateLimiterService.isAllowed(user1));
        }
        assertFalse(rateLimiterService.isAllowed(user1));

        // User2 should still be allowed since limits are per-user
        assertTrue(rateLimiterService.isAllowed(user2));
    }
}
