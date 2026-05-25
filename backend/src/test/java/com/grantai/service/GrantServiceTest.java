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
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

    @Test
    void testSearchRedisCacheHit() throws Exception {
        String email = "test@example.com";
        ProfileResponse profile = new ProfileResponse(
            "user-123",
            email,
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

        Grant grant = new Grant();
        grant.setId("grant-1");
        grant.setTitle("Test Grant");
        grant.setAmount(new BigDecimal("5000"));
        grant.setCountryName("USA");
        grant.setDeadline(java.time.LocalDate.now().plusDays(30));

        when(profileService.getProfile(email)).thenReturn(profile);
        when(grantRepository.search(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(grant)));

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
        ProfileResponse profile = new ProfileResponse(
            "user-123",
            email,
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

        Grant grant = new Grant();
        grant.setId("grant-1");
        grant.setTitle("Test Grant");
        grant.setAmount(new BigDecimal("5000"));
        grant.setCountryName("USA");
        grant.setDeadline(java.time.LocalDate.now().plusDays(30));

        when(profileService.getProfile(email)).thenReturn(profile);
        when(grantRepository.search(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(grant)));

        // Mock Redis cache miss
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);

        Map<String, AiEngineClient.ScoreResult> fetchedScores = Map.of(
            "grant-1", new AiEngineClient.ScoreResult(90, "Excellent fit")
        );
        when(aiEngineClient.fetchScores(eq(profile), anyMap(), anyInt())).thenReturn(fetchedScores);

        GrantSearchResponse response = grantService.search(email, "query", null, null, null, null, null, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.items().size());
        assertEquals(90, response.items().get(0).matchScore());

        // Verify that we read from Redis (which missed), called the AI Engine, and stored in Redis
        verify(valueOperations).get(anyString());
        verify(aiEngineClient).fetchScores(eq(profile), anyMap(), anyInt());
        verify(valueOperations).set(anyString(), anyString(), eq(Duration.ofMinutes(5)));
    }
}
