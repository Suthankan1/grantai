package com.grantai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "user_profiles", indexes = {
    @Index(name = "idx_profile_user_id", columnList = "user_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ── Step 1: Personal Info ──────────────────────────────────────
    @Column(length = 100)
    private String country;

    @Column(name = "profile_photo_url", columnDefinition = "TEXT")
    private String profilePhotoUrl;

    // ── Step 2: Academic Background ────────────────────────────────
    @Column(length = 200)
    private String university;

    @Enumerated(EnumType.STRING)
    @Column(name = "degree_level", length = 20)
    private DegreeLevel degreeLevel;

    @Column(name = "field_of_study", length = 150)
    private String fieldOfStudy;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(precision = 3, scale = 2)
    private BigDecimal gpa;

    // ── Step 3: Research Interests ─────────────────────────────────
    @Column(name = "research_interests", columnDefinition = "TEXT")
    private String researchInterests;   // JSON array stored as text

    // ── Step 4: Grant Preferences ──────────────────────────────────
    @Column(name = "grant_types", columnDefinition = "TEXT")
    private String grantTypes;          // JSON array stored as text

    @Column(name = "preferred_countries", columnDefinition = "TEXT")
    private String preferredCountries;  // JSON array stored as text

    @Column(name = "min_grant_amount")
    private Integer minGrantAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "deadline_preference", length = 20)
    private DeadlinePreference deadlinePreference;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum DegreeLevel {
        BACHELOR, MASTER, PHD, POSTDOC, OTHER
    }

    public enum DeadlinePreference {
        ANY, ONE_MONTH, THREE_MONTHS, SIX_MONTHS, ONE_YEAR
    }
}
