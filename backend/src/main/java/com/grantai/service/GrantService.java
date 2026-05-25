package com.grantai.service;

import com.grantai.dto.GrantDetailResponse;
import com.grantai.dto.GrantSearchResponse;
import com.grantai.dto.GrantSummaryResponse;
import com.grantai.dto.ProfileResponse;
import com.grantai.entity.Grant;
import com.grantai.repository.GrantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GrantService {

    private static final int DEFAULT_PAGE_SIZE = 12;

    private final GrantRepository grantRepository;
    private final ProfileService profileService;
    private final AiEngineClient aiEngineClient;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public GrantSearchResponse search(
        String userEmail,
        String q,
        String field,
        String country,
        String type,
        BigDecimal minAmount,
        LocalDate maxDeadline,
        int page,
        int size
    ) {
        ProfileResponse profile = loadProfile(userEmail);
        int pageSize = size > 0 ? size : DEFAULT_PAGE_SIZE;
        int pageNumber = Math.max(page, 0);
        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        Page<Grant> grants;
        try {
            grants = grantRepository.search(
                normalizeText(q),
                normalizeCsv(field),
                normalizeCsv(country),
                normalizeCsv(type),
                minAmount,
                maxDeadline,
                pageable
            );
        } catch (Exception ex) {
            log.warn("Full-text search failed, using ILIKE fallback: {}", ex.getMessage());
            grants = grantRepository.searchFallback(
                normalizeText(q),
                normalizeCsv(field),
                normalizeCsv(country),
                normalizeCsv(type),
                minAmount,
                maxDeadline,
                pageable
            );
        }

        Map<String, Object> filters = buildAiFilters(normalizeText(q), field, country, type, minAmount, maxDeadline);
        final Map<String, AiEngineClient.ScoreResult> aiScores;

        if (profile != null && profile.isProfileComplete()) {
            String filtersHash = "";
            try {
                String serializedFilters = objectMapper.writeValueAsString(filters);
                filtersHash = DigestUtils.md5DigestAsHex(serializedFilters.getBytes(StandardCharsets.UTF_8));
            } catch (Exception ex) {
                log.warn("Failed to serialize filters for hashing: {}", ex.getMessage());
                filtersHash = String.valueOf(filters.hashCode());
            }

            String redisKey = String.format("ai:scores:%s:%s", profile.userId(), filtersHash);
            Map<String, AiEngineClient.ScoreResult> cachedScores = null;
            try {
                String cached = redisTemplate.opsForValue().get(redisKey);
                if (cached != null) {
                    cachedScores = objectMapper.readValue(cached, new TypeReference<Map<String, AiEngineClient.ScoreResult>>() {});
                }
            } catch (Exception ex) {
                log.warn("Error reading from Redis cache: {}", ex.getMessage());
            }

            if (cachedScores == null) {
                Map<String, AiEngineClient.ScoreResult> fetched = aiEngineClient.fetchScores(profile, filters, pageSize);
                if (fetched != null && !fetched.isEmpty()) {
                    try {
                        String serialized = objectMapper.writeValueAsString(fetched);
                        redisTemplate.opsForValue().set(redisKey, serialized, Duration.ofMinutes(5));
                    } catch (Exception ex) {
                        log.warn("Error writing to Redis cache: {}", ex.getMessage());
                    }
                }
                aiScores = fetched != null ? fetched : Map.of();
            } else {
                aiScores = cachedScores;
            }
        } else {
            aiScores = Map.of();
        }

        List<GrantSummaryResponse> items = grants.getContent().stream()
            .map(grant -> toSummary(grant, profile, aiScores))
            .collect(Collectors.toList());

        return new GrantSearchResponse(
            items,
            grants.getNumber(),
            grants.getSize(),
            grants.getTotalElements(),
            grants.getTotalPages(),
            grants.hasNext()
        );
    }

    @Transactional(readOnly = true)
    public GrantDetailResponse getById(String userEmail, String id) {
        ProfileResponse profile = loadProfile(userEmail);
        Grant grant = grantRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grant not found"));

        final Map<String, AiEngineClient.ScoreResult> aiScores;
        if (profile != null && profile.isProfileComplete()) {
            aiScores = aiEngineClient.fetchScores(
                profile,
                buildAiFilters(null, grant.getField(), grant.getCountryName(), grant.getGrantType(), grant.getAmount(), grant.getDeadline()),
                1
            );
        } else {
            aiScores = Map.of();
        }

        GrantSummaryResponse summary = toSummary(grant, profile, aiScores);
        return new GrantDetailResponse(
            summary.id(),
            summary.title(),
            summary.provider(),
            summary.grantType(),
            summary.field(),
            summary.countryName(),
            summary.countryCode(),
            summary.amount(),
            summary.currency(),
            summary.deadline(),
            summary.description(),
            grant.getEligibility(),
            grant.getDocumentsRequired(),
            grant.getTimeline(),
            grant.getApplicationUrl(),
            summary.sourceUrl(),
            summary.matchScore(),
            summary.matchReasoning(),
            grant.getCreatedAt(),
            grant.getUpdatedAt()
        );
    }

    private ProfileResponse loadProfile(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return null;
        }

        try {
            return profileService.getProfile(userEmail);
        } catch (UsernameNotFoundException ex) {
            return null;
        }
    }

    private GrantSummaryResponse toSummary(Grant grant, ProfileResponse profile, Map<String, AiEngineClient.ScoreResult> aiScores) {
        AiEngineClient.ScoreResult scoreResult = aiScores != null ? aiScores.get(grant.getId()) : null;
        final int score;
        final String reasoning;
        if (aiScores == null || aiScores.isEmpty()) {
            score = 50;
            reasoning = "Complete your profile for personalised match scoring.";
        } else if (scoreResult != null) {
            score = clamp(scoreResult.score());
            reasoning = scoreResult.reasoning();
        } else {
            score = calculateHeuristicScore(profile, grant);
            reasoning = buildHeuristicReasoning(profile, grant, score);
        }

        return new GrantSummaryResponse(
            grant.getId(),
            grant.getTitle(),
            grant.getProvider(),
            grant.getGrantType(),
            grant.getField(),
            grant.getCountryName(),
            grant.getCountryCode(),
            grant.getAmount(),
            grant.getCurrency(),
            grant.getDeadline(),
            grant.getDescription(),
            score,
            reasoning,
            grant.getSourceUrl()
        );
    }

    private Map<String, Object> buildAiFilters(String q, String field, String country, String type, BigDecimal minAmount, LocalDate maxDeadline) {
        Map<String, Object> filters = new HashMap<>();
        if (q != null && !q.isBlank()) {
            filters.put("q", q.trim());
        }
        if (field != null && !field.isBlank()) {
            filters.put("field", normalizeCsv(field));
        }
        if (country != null && !country.isBlank()) {
            filters.put("country", normalizeCsv(country));
        }
        if (type != null && !type.isBlank()) {
            filters.put("type", normalizeCsv(type));
        }
        if (minAmount != null) {
            filters.put("minAmount", minAmount);
        }
        if (maxDeadline != null) {
            filters.put("maxDeadline", maxDeadline.toString());
        }
        return filters;
    }

    private int calculateHeuristicScore(ProfileResponse profile, Grant grant) {
        if (profile == null) {
            return 55;
        }

        int score = 42;
        score += matchesAny(profile.grantTypes(), grant.getGrantType()) ? 22 : 0;
        score += matchesAny(profile.preferredCountries(), grant.getCountryName(), grant.getCountryCode()) ? 14 : 0;
        score += matchesAny(profile.researchInterests(), grant.getField(), grant.getTitle(), grant.getDescription()) ? 12 : 0;
        score += profile.minGrantAmount() != null && grant.getAmount() != null && grant.getAmount().compareTo(BigDecimal.valueOf(profile.minGrantAmount())) >= 0 ? 8 : 0;

        if (profile.deadlinePreference() != null && grant.getDeadline() != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), grant.getDeadline());
            score += switch (profile.deadlinePreference().toUpperCase(Locale.ROOT)) {
                case "ANY" -> 4;
                case "ONE_MONTH" -> days <= 31 ? 8 : -4;
                case "THREE_MONTHS" -> days <= 92 ? 8 : -2;
                case "SIX_MONTHS", "ONE_YEAR" -> days <= 365 ? 4 : 0;
                default -> 0;
            };
        }

        return clamp(score);
    }

    private String buildHeuristicReasoning(ProfileResponse profile, Grant grant, int score) {
        if (profile == null) {
            return "This grant was ranked from the grant metadata alone because no saved profile was available. The score reflects deadline, amount, and topical relevance.";
        }

        List<String> reasons = Arrays.asList(
            matchesAny(profile.grantTypes(), grant.getGrantType()) ? "grant type" : null,
            matchesAny(profile.researchInterests(), grant.getField(), grant.getTitle()) ? "research interests" : null,
            matchesAny(profile.preferredCountries(), grant.getCountryName(), grant.getCountryCode()) ? "target country" : null,
            profile.minGrantAmount() != null && grant.getAmount() != null && grant.getAmount().compareTo(BigDecimal.valueOf(profile.minGrantAmount())) >= 0 ? "funding target" : null
        ).stream().filter(item -> item != null && !item.isBlank()).toList();

        String body = reasons.isEmpty()
            ? "the profile broadly"
            : String.join(", ", reasons);

        return "This grant aligns with " + body + ". Deadline and award size keep it at a " + score + "% match.";
    }

    private boolean matchesAny(List<String> haystack, String... candidates) {
        if (haystack == null || haystack.isEmpty()) {
            return false;
        }

        for (String value : haystack) {
            if (value == null || value.isBlank()) {
                continue;
            }
            String normalizedValue = value.trim().toLowerCase(Locale.ROOT);
            for (String candidate : candidates) {
                if (candidate == null || candidate.isBlank()) {
                    continue;
                }
                String normalizedCandidate = candidate.trim().toLowerCase(Locale.ROOT);
                if (normalizedValue.contains(normalizedCandidate) || normalizedCandidate.contains(normalizedValue)) {
                    return true;
                }
            }
        }

        return false;
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeCsv(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return Arrays.stream(value.split(","))
            .map(String::trim)
            .filter(text -> !text.isBlank())
            .map(text -> text.toLowerCase(Locale.ROOT))
            .collect(Collectors.joining(","));
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }
}