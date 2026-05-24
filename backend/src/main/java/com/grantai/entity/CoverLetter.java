package com.grantai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "cover_letters", indexes = {
    @Index(name = "idx_cover_letter_user", columnList = "user_id"),
    @Index(name = "idx_cover_letter_grant", columnList = "grant_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoverLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "grant_id", nullable = false, length = 36)
    private String grantId;

    @Column(name = "grant_title", nullable = false, length = 220)
    private String grantTitle;

    @Column(name = "grant_provider", nullable = false, length = 180)
    private String grantProvider;

    @Column(name = "grant_amount", precision = 14, scale = 2)
    private BigDecimal grantAmount;

    @Column(name = "grant_currency", length = 12)
    private String grantCurrency;

    @Column(name = "grant_deadline")
    private LocalDate grantDeadline;

    @Column(name = "grant_description", columnDefinition = "TEXT")
    private String grantDescription;

    @Column(name = "tone", length = 40)
    private String tone;

    @Column(name = "length_preference", length = 40)
    private String lengthPreference;

    @Column(name = "emphasis", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> emphasis;

    @Column(name = "regeneration_style", length = 40)
    private String regenerationStyle;

    @Column(name = "custom_prompt", columnDefinition = "TEXT")
    private String customPrompt;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "GENERATING";

    @Column(name = "add_to_tracker", nullable = false)
    @Builder.Default
    private boolean addToTracker = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
