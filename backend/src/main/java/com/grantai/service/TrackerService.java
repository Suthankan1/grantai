package com.grantai.service;

import com.grantai.dto.DashboardStatsResponse;
import com.grantai.dto.ProfileResponse;
import com.grantai.dto.TrackerCreateRequest;
import com.grantai.dto.TrackerUpdateRequest;
import com.grantai.dto.TrackerResponse;
import com.grantai.entity.CoverLetter;
import com.grantai.entity.Grant;
import com.grantai.entity.TrackerEntry;
import com.grantai.entity.User;
import com.grantai.repository.CoverLetterRepository;
import com.grantai.repository.GrantRepository;
import com.grantai.repository.TrackerRepository;
import com.grantai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackerService {

    private final TrackerRepository trackerRepository;
    private final UserRepository userRepository;
    private final GrantRepository grantRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final ProfileService profileService;

    @Transactional(readOnly = true)
    public List<TrackerResponse> list(String userEmail) {
        User user = requireUser(userEmail);
        return trackerRepository.findAllByUser_Id(user.getId()).stream()
            .map(entry -> toResponse(entry, user.getId()))
            .sorted(Comparator.comparing(TrackerResponse::updatedAt).reversed())
            .collect(Collectors.toList());
    }

    @Transactional
    public TrackerResponse create(String userEmail, TrackerCreateRequest request) {
        User user = requireUser(userEmail);
        Grant grant = grantRepository.findById(request.grantId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grant not found"));

        Optional<TrackerEntry> existing = trackerRepository.findByUser_IdAndGrant_Id(user.getId(), grant.getId());
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Grant is already tracked");
        }

        String status = request.status() != null ? request.status() : "Draft";
        LocalDate appliedDate = request.appliedDate();
        if ("Applied".equalsIgnoreCase(status) && appliedDate == null) {
            appliedDate = LocalDate.now();
        }

        TrackerEntry entry = TrackerEntry.builder()
            .user(user)
            .grant(grant)
            .status(status)
            .bookmarked("Draft".equalsIgnoreCase(status))
            .notes(request.notes() != null ? request.notes() : "")
            .appliedDate(appliedDate)
            .build();

        TrackerEntry saved = trackerRepository.save(entry);

        // Check if there is an existing cover letter, link it or update it
        List<CoverLetter> letters = coverLetterRepository.findByUser_IdAndGrantId(user.getId(), grant.getId());
        for (CoverLetter letter : letters) {
            if (!letter.isAddToTracker()) {
                letter.setAddToTracker(true);
                coverLetterRepository.save(letter);
            }
        }

        return toResponse(saved, user.getId());
    }

    @Transactional
    public TrackerResponse update(String userEmail, String id, TrackerUpdateRequest request) {
        User user = requireUser(userEmail);
        TrackerEntry entry = trackerRepository.findByIdAndUser_Id(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tracker entry not found"));

        if (request.status() != null) {
            String oldStatus = entry.getStatus();
            String newStatus = request.status();
            entry.setStatus(newStatus);
            entry.setBookmarked("Draft".equalsIgnoreCase(newStatus));
            if ("Applied".equalsIgnoreCase(newStatus) && !"Applied".equalsIgnoreCase(oldStatus) && entry.getAppliedDate() == null) {
                entry.setAppliedDate(LocalDate.now());
            }
        }
        if (request.notes() != null) {
            entry.setNotes(request.notes());
        }
        if (request.appliedDate() != null) {
            entry.setAppliedDate(request.appliedDate());
        }

        TrackerEntry saved = trackerRepository.save(entry);
        return toResponse(saved, user.getId());
    }

    @Transactional
    public void delete(String userEmail, String id) {
        User user = requireUser(userEmail);
        TrackerEntry entry = trackerRepository.findByIdAndUser_Id(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tracker entry not found"));
        trackerRepository.delete(entry);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(String userEmail) {
        User user = requireUser(userEmail);
        List<TrackerEntry> entries = trackerRepository.findAllByUser_Id(user.getId());

        long totalApplied = entries.stream()
            .filter(e -> List.of("Applied", "Under Review", "Won", "Rejected").contains(e.getStatus()))
            .count();

        long wonCount = entries.stream().filter(e -> "Won".equalsIgnoreCase(e.getStatus())).count();
        long rejectedCount = entries.stream().filter(e -> "Rejected".equalsIgnoreCase(e.getStatus())).count();
        double winRate = (wonCount + rejectedCount) > 0
            ? (double) wonCount / (wonCount + rejectedCount) * 100.0
            : 0.0;

        // Calculate average match score using heuristic or profile settings
        ProfileResponse profile = null;
        try {
            profile = profileService.getProfile(userEmail);
        } catch (Exception ignored) {}

        final ProfileResponse finalProfile = profile;
        double avgScoreSum = 0;
        int scoredCount = 0;
        for (TrackerEntry entry : entries) {
            int score = calculateHeuristicScore(finalProfile, entry.getGrant());
            avgScoreSum += score;
            scoredCount++;
        }
        int avgMatchScore = scoredCount > 0 ? (int) Math.round(avgScoreSum / scoredCount) : 0;

        BigDecimal totalWonAmount = entries.stream()
            .filter(e -> "Won".equalsIgnoreCase(e.getStatus()) && e.getGrant().getAmount() != null)
            .map(e -> e.getGrant().getAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAppliedAmount = entries.stream()
            .filter(e -> ("Applied".equalsIgnoreCase(e.getStatus()) || "Under Review".equalsIgnoreCase(e.getStatus())) && e.getGrant().getAmount() != null)
            .map(e -> e.getGrant().getAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Upcoming Deadlines (within next 30 days)
        LocalDate now = LocalDate.now();
        List<DashboardStatsResponse.DeadlineEvent> upcomingDeadlines = entries.stream()
            .filter(e -> e.getGrant().getDeadline() != null && !e.getGrant().getDeadline().isBefore(now))
            .filter(e -> ChronoUnit.DAYS.between(now, e.getGrant().getDeadline()) <= 30)
            .filter(e -> !List.of("Won", "Rejected").contains(e.getStatus()))
            .map(e -> {
                long daysLeft = ChronoUnit.DAYS.between(now, e.getGrant().getDeadline());
                return new DashboardStatsResponse.DeadlineEvent(
                    e.getId(),
                    e.getGrant().getId(),
                    e.getGrant().getTitle(),
                    e.getGrant().getProvider(),
                    e.getGrant().getDeadline(),
                    daysLeft
                );
            })
            .sorted(Comparator.comparing(DashboardStatsResponse.DeadlineEvent::deadline))
            .collect(Collectors.toList());

        // Recent Activity Feed
        List<DashboardStatsResponse.ActivityLog> recentActivities = new ArrayList<>();
        entries.stream()
            .sorted(Comparator.comparing(TrackerEntry::getUpdatedAt).reversed())
            .limit(5)
            .forEach(e -> {
                String timeAgo = calculateTimeAgo(e.getUpdatedAt());
                recentActivities.add(new DashboardStatsResponse.ActivityLog(
                    UUID.randomUUID().toString(),
                    "Application for '" + e.getGrant().getTitle() + "' moved to " + e.getStatus() + ".",
                    timeAgo
                ));
            });

        if (recentActivities.isEmpty()) {
            recentActivities.add(new DashboardStatsResponse.ActivityLog("1", "Welcome to your tracker! Click + in any column to start tracking grants.", "Just now"));
        }

        long grantsBookmarked = entries.stream()
            .filter(e -> "Draft".equalsIgnoreCase(e.getStatus()))
            .count();

        return new DashboardStatsResponse(
            totalApplied,
            winRate,
            avgMatchScore,
            grantsBookmarked,
            totalWonAmount,
            totalAppliedAmount,
            upcomingDeadlines,
            recentActivities
        );
    }

    private User requireUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private TrackerResponse toResponse(TrackerEntry entry, String userId) {
        List<CoverLetter> letters = coverLetterRepository.findByUser_IdAndGrantId(userId, entry.getGrant().getId());
        Optional<CoverLetter> letterOpt = letters.stream()
            .max(Comparator.comparing(CoverLetter::getUpdatedAt));
        String coverLetterStatus = letterOpt.map(CoverLetter::getStatus).orElse("None");
        String coverLetterId = letterOpt.map(CoverLetter::getId).orElse(null);

        return new TrackerResponse(
            entry.getId(),
            entry.getGrant().getId(),
            entry.getGrant().getTitle(),
            entry.getGrant().getProvider(),
            entry.getGrant().getAmount(),
            entry.getGrant().getCurrency(),
            entry.getGrant().getDeadline(),
            entry.getStatus(),
            entry.getAppliedDate(),
            entry.getNotes(),
            coverLetterStatus,
            coverLetterId,
            entry.getCreatedAt(),
            entry.getUpdatedAt(),
            entry.isBookmarked()
        );
    }

    private String calculateTimeAgo(java.time.Instant instant) {
        if (instant == null) return "Unknown";
        long seconds = ChronoUnit.SECONDS.between(instant, java.time.Instant.now());
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        return days + "d ago";
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

        return Math.max(0, Math.min(100, score));
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
}
