package com.grantai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grantai.dto.ProfileResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class AiEngineClient {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${ai-engine.url:http://localhost:8000}")
    private String aiEngineUrl;

    @Value("${ai-engine.api-key:}")
    private String aiEngineApiKey;

    public AiEngineClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    }

    public Map<String, ScoreResult> fetchScores(ProfileResponse profile, Map<String, Object> filters, int nResults) {
        if (profile == null) {
            return Map.of();
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("profile", objectMapper.convertValue(profile, new TypeReference<Map<String, Object>>() {}));
        payload.put("n_results", Math.max(1, nResults));
        payload.put("filters", filters);

        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(aiEngineUrl.replaceAll("/$", "") + "/ai/match"))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)));

            if (aiEngineApiKey != null && !aiEngineApiKey.isBlank()) {
                requestBuilder.header("X-API-Key", aiEngineApiKey);
            }

            HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("AI match request failed with status {}", response.statusCode());
                return Map.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode matches = root.path("matches");
            Map<String, ScoreResult> scores = new HashMap<>();

            if (matches.isArray()) {
                for (JsonNode node : matches) {
                    String id = node.path("id").asText(null);
                    if (id == null || id.isBlank()) {
                        continue;
                    }
                    scores.put(id, new ScoreResult(
                        node.path("compatibility_score").asInt(0),
                        node.path("reasoning").asText("Compatibility was estimated from the applicant profile and grant metadata.")
                    ));
                }
            }

            return scores;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("AI match request interrupted: {}", ex.getMessage());
            return Map.of();
        } catch (IOException ex) {
            log.warn("AI match request failed: {}", ex.getMessage());
            return Map.of();
        }
    }

    public record ScoreResult(int score, String reasoning) {}
}