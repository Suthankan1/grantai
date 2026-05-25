package com.grantai.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimiterService {

    private final ConcurrentHashMap<String, RateLimitState> limiters = new ConcurrentHashMap<>();

    /**
     * Determines whether the user is allowed to proceed based on a limit of 10 requests per minute.
     *
     * @param userId the ID of the user
     * @return true if allowed, false if throttled
     */
    public boolean isAllowed(String userId) {
        if (userId == null || userId.isBlank()) {
            return true; // Bypass rate limiting for missing or system users if any
        }
        RateLimitState state = limiters.computeIfAbsent(userId, k -> new RateLimitState());
        return state.allowRequest(10);
    }

    public static class RateLimitState {
        private volatile long windowStart = System.currentTimeMillis();
        private final AtomicInteger count = new AtomicInteger(0);

        public synchronized boolean allowRequest(int limit) {
            long now = System.currentTimeMillis();
            if (now - windowStart >= 60000) {
                windowStart = now;
                count.set(0);
            }
            int currentCount = count.incrementAndGet();
            return currentCount <= limit;
        }
    }
}
