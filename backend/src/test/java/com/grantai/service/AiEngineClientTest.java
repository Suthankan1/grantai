package com.grantai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grantai.dto.ProfileResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiEngineClientTest {

    @Mock
    private RateLimiterService rateLimiterService;

    private AiEngineClient aiEngineClient;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        aiEngineClient = new AiEngineClient(objectMapper, rateLimiterService);
        ReflectionTestUtils.setField(aiEngineClient, "aiEngineUrl", "http://localhost:8000");
    }

    @Test
    void testFetchScoresWhenRateLimited() {
        ProfileResponse profile = new ProfileResponse(
            "user-123",
            "user@example.com",
            "User One",
            "USA",
            null,
            "Uni",
            "PhD",
            "CS",
            2026,
            new BigDecimal("4.0"),
            List.of("AI"),
            List.of("Research"),
            List.of("USA"),
            1000,
            "ANY",
            true
        );

        when(rateLimiterService.isAllowed("user-123")).thenReturn(false);

        Map<String, AiEngineClient.ScoreResult> scores = aiEngineClient.fetchScores(profile, Collections.emptyMap(), 10);
        assertTrue(scores.isEmpty(), "Scores should be empty when rate limit is exceeded");

        verify(rateLimiterService).isAllowed("user-123");
    }
}
