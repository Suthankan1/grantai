package com.grantai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grantai.dto.CoverLetterGenerateRequest;
import com.grantai.dto.CoverLetterResponse;
import com.grantai.dto.CoverLetterUpdateRequest;
import com.grantai.dto.ProfileResponse;
import com.grantai.entity.CoverLetter;
import com.grantai.entity.Grant;
import com.grantai.entity.User;
import com.grantai.repository.CoverLetterRepository;
import com.grantai.repository.GrantRepository;
import com.grantai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;
    private final GrantRepository grantRepository;
    private final ProfileService profileService;
    private final AiEngineClient aiEngineClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public SseEmitter generate(String userEmail, CoverLetterGenerateRequest request) {
        User user = requireUser(userEmail);
        Grant grant = grantRepository.findById(request.grantId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grant not found"));

        ProfileResponse profile = profileService.getProfile(userEmail);
        CoverLetter letter = coverLetterRepository.save(CoverLetter.builder()
            .user(user)
            .grantId(grant.getId())
            .grantTitle(grant.getTitle())
            .grantProvider(grant.getProvider())
            .grantAmount(grant.getAmount())
            .grantCurrency(grant.getCurrency())
            .grantDeadline(grant.getDeadline())
            .grantDescription(grant.getDescription())
            .tone(defaultTone(request.tone()))
            .lengthPreference(defaultLength(request.length()))
            .emphasis(defaultEmphasis(request.emphasis()))
            .regenerationStyle(defaultRegenerationStyle(request.regenerationStyle()))
            .customPrompt(normalizeText(request.customPrompt()))
            .content("")
            .status("GENERATING")
            .build());

        SseEmitter emitter = new SseEmitter(0L);
        CompletableFuture.runAsync(() -> streamGeneration(emitter, profile, grant, letter));
        return emitter;
    }

    @Transactional(readOnly = true)
    public CoverLetterResponse getById(String userEmail, String letterId) {
        User user = requireUser(userEmail);
        CoverLetter letter = coverLetterRepository.findByIdAndUser_Id(letterId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cover letter not found"));
        return toResponse(letter);
    }

    @Transactional(readOnly = true)
    public List<CoverLetterResponse> list(String userEmail) {
        User user = requireUser(userEmail);
        return coverLetterRepository.findAllByUser_IdOrderByUpdatedAtDesc(user.getId()).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public CoverLetterResponse update(String userEmail, String letterId, CoverLetterUpdateRequest request) {
        User user = requireUser(userEmail);
        CoverLetter letter = coverLetterRepository.findByIdAndUser_Id(letterId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cover letter not found"));

        if (request.content() != null) {
            letter.setContent(request.content());
            letter.setStatus("SAVED");
        }
        if (request.addToTracker() != null) {
            letter.setAddToTracker(request.addToTracker());
        }

        CoverLetter saved = coverLetterRepository.save(letter);
        return toResponse(saved);
    }

    private void streamGeneration(SseEmitter emitter, ProfileResponse profile, Grant grant, CoverLetter letter) {
        StringBuilder content = new StringBuilder();

        try (InputStream stream = aiEngineClient.streamLetter(
            objectMapper.convertValue(profile, new TypeReference<Map<String, Object>>() {}),
            buildGrantPayload(grant),
            buildOptionsPayload(letter)
        )) {
            emitter.send(SseEmitter.event().name("meta").data(Map.of("letterId", letter.getId())));

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data:")) {
                        continue;
                    }
                    String raw = line.substring(5).trim();
                    if (raw.isBlank() || "[DONE]".equals(raw)) {
                        continue;
                    }

                    JsonNode node = objectMapper.readTree(raw);
                    String delta = node.path("delta").asText("");
                    if (delta.isBlank()) {
                        continue;
                    }

                    content.append(delta);
                    emitter.send(SseEmitter.event().name("chunk").data(Map.of("delta", delta)));
                }
            }

            letter.setContent(content.toString());
            letter.setStatus("READY");
            coverLetterRepository.save(letter);

            emitter.send(SseEmitter.event().name("done").data(Map.of("letterId", letter.getId())));
            emitter.complete();
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.warn("Cover letter generation failed: {}", ex.getMessage());
            letter.setStatus("FAILED");
            coverLetterRepository.save(letter);

            try {
                emitter.send(SseEmitter.event().name("error").data(Map.of("message", "Failed to generate cover letter.")));
            } catch (IOException ignored) {
                log.debug("Could not push SSE error event", ignored);
            }
            emitter.completeWithError(ex);
        }
    }

    private User requireUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private Map<String, Object> buildGrantPayload(Grant grant) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", grant.getId());
        payload.put("title", grant.getTitle());
        payload.put("provider", grant.getProvider());
        payload.put("grant_type", grant.getGrantType());
        payload.put("field", grant.getField());
        payload.put("country", grant.getCountryName());
        payload.put("amount", grant.getAmount());
        payload.put("currency", grant.getCurrency());
        payload.put("deadline", grant.getDeadline() != null ? grant.getDeadline().toString() : null);
        payload.put("description", grant.getDescription());
        payload.put("eligibility", grant.getEligibility());
        return payload;
    }

    private Map<String, Object> buildOptionsPayload(CoverLetter letter) {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("tone", letter.getTone());
        options.put("length", letter.getLengthPreference());
        options.put("emphasis", letter.getEmphasis());
        options.put("regeneration_style", letter.getRegenerationStyle());
        options.put("custom_prompt", letter.getCustomPrompt());
        return options;
    }

    private CoverLetterResponse toResponse(CoverLetter letter) {
        return new CoverLetterResponse(
            letter.getId(),
            letter.getGrantId(),
            letter.getGrantTitle(),
            letter.getGrantProvider(),
            letter.getGrantAmount(),
            letter.getGrantCurrency(),
            letter.getGrantDeadline(),
            letter.getGrantDescription(),
            letter.getTone(),
            letter.getLengthPreference(),
            letter.getEmphasis() != null ? letter.getEmphasis() : List.of(),
            letter.getRegenerationStyle(),
            letter.getCustomPrompt(),
            letter.getContent(),
            letter.getStatus(),
            letter.isAddToTracker(),
            letter.getCreatedAt(),
            letter.getUpdatedAt()
        );
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String defaultTone(String value) {
        return normalizeText(value) != null ? normalizeText(value) : "Professional";
    }

    private String defaultLength(String value) {
        return normalizeText(value) != null ? normalizeText(value) : "Standard 500w";
    }

    private List<String> defaultEmphasis(List<String> values) {
        if (values == null || values.isEmpty()) {
            return List.of("achievements");
        }
        return values.stream().map(this::normalizeText).filter(item -> item != null).toList();
    }

    private String defaultRegenerationStyle(String value) {
        return normalizeText(value) != null ? normalizeText(value) : "default";
    }
}
