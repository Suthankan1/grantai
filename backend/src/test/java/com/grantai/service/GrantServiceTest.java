package com.grantai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grantai.dto.GrantSearchResponse;
import com.grantai.dto.ProfileResponse;
import com.grantai.entity.Grant;
import com.grantai.repository.GrantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GrantServiceTest {

    @Mock
    private GrantRepository grantRepository;

    @Mock
    private ProfileService profileService;

    @Mock
    private AiEngineClient aiEngineClient;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private ObjectMapper objectMapper;
    private GrantService grantService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        grantService = new GrantService(
            grantRepository,
            profileService,
            aiEngineClient,
            redisTemplate,
            objectMapper
        );
    }

    private ProfileResponse completeProfile(boolean complete) {
        return new ProfileResponse(
            "user-123",
            "test@example.com",
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
            complete
        );
    }

    private Grant sampleGrant() {
        Grant grant = new Grant();
        grant.setId("grant-1");
        grant.setTitle("Test Grant");
        grant.setAmount(new BigDecimal("5000"));
        grant.setCountryName("USA");
        grant.setDeadline(java.time.LocalDate.now().plusDays(30));
        return grant;
    }

    @Test
    void testSearchRedisCacheHit() throws Exception {
        String email = "test@example.com";
        ProfileResponse profile = completeProfile(true);

        when(profileService.getProfile(email)).thenReturn(profile);
        when(grantRepository.search(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(sampleGrant())));

        // Mock Redis cache hit
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        Map<String, AiEngineClient.ScoreResult> cachedScores = Map.of(
            "grant-1", new AiEngineClient.ScoreResult(85, "Good fit")
        );
        String cachedJson = objectMapper.writeValueAsString(cachedScores);
        when(valueOperations.get(anyString())).thenReturn(cachedJson);

        GrantSearchResponse response = grantService.search(email, "query", null, null, null, null, null, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.items().size());
        assertEquals(85, response.items().get(0).matchScore());
        assertEquals("Good fit", response.items().get(0).matchReasoning());

        // Verify that we read from Redis and never called the AI Engine
        verify(valueOperations).get(anyString());
        verifyNoInteractions(aiEngineClient);
    }

    @Test
    void testSearchRedisCacheMiss() throws Exception {
        String email = "test@example.com";
        ProfileResponse profile = completeProfile(true);

        when(profileService.getProfile(email)).thenReturn(profile);
        when(grantRepository.search(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(sampleGrant())));

        // Mock Redis cache miss
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);

        Map<String, AiEngineClient.ScoreResult> fetchedScores = Map.of(
            "grant-1", new AiEngineClient.ScoreResult(90, "Excellent fit")
        );
        // Verify AI is called with exactly pageSize (10), not pageSize * (page + 1)
        when(aiEngineClient.fetchScores(eq(profile), anyMap(), eq(10))).thenReturn(fetchedScores);

        GrantSearchResponse response = grantService.search(email, "query", null, null, null, null, null, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.items().size());
        assertEquals(90, response.items().get(0).matchScore());

        // Verify that we read from Redis (miss), called the AI Engine with pageSize only, and stored in Redis
        verify(valueOperations).get(anyString());
        verify(aiEngineClient).fetchScores(eq(profile), anyMap(), eq(10));
        verify(valueOperations).set(anyString(), anyString(), eq(Duration.ofMinutes(5)));
    }

    @Test
    void testSearchIncompleteProfileSkipsAiAndReturnsDefaultScore() {
        String email = "partial@example.com";
        ProfileResponse incompleteProfile = completeProfile(false);

        when(profileService.getProfile(email)).thenReturn(incompleteProfile);
        when(grantRepository.search(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(sampleGrant())));

        GrantSearchResponse response = grantService.search(email, null, null, null, null, null, null, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.items().size());
        assertEquals(50, response.items().get(0).matchScore());
        assertEquals("Complete your profile for personalised match scoring.", response.items().get(0).matchReasoning());

        // AI Engine and Redis must not be touched
        verifyNoInteractions(aiEngineClient);
        verifyNoInteractions(redisTemplate);
    }

    @Test
    void testSearchNullProfileSkipsAiAndReturnsDefaultScore() {
        // Simulate a guest / not-logged-in user
        when(grantRepository.search(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(sampleGrant())));

        GrantSearchResponse response = grantService.search(null, null, null, null, null, null, null, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.items().size());
        assertEquals(50, response.items().get(0).matchScore());
        assertEquals("Complete your profile for personalised match scoring.", response.items().get(0).matchReasoning());

        // AI Engine and Redis must not be touched
        verifyNoInteractions(aiEngineClient);
        verifyNoInteractions(redisTemplate);
    }
}
