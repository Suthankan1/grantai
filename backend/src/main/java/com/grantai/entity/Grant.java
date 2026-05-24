package com.grantai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(name = "grants", indexes = {
    @Index(name = "idx_grant_type", columnList = "grant_type"),
    @Index(name = "idx_grant_country", columnList = "country_name"),
    @Index(name = "idx_grant_field", columnList = "field"),
    @Index(name = "idx_grant_deadline", columnList = "deadline")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, length = 36)
    private String id;

    @Column(nullable = false, length = 220)
    private String title;

    @Column(nullable = false, length = 180)
    private String provider;

    @Column(name = "grant_type", nullable = false, length = 40)
    private String grantType;

    @Column(length = 140)
    private String field;

    @Column(name = "country_code", length = 8)
    private String countryCode;

    @Column(name = "country_name", nullable = false, length = 120)
    private String countryName;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(length = 12)
    private String currency;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "timeline", columnDefinition = "TEXT")
    private String timeline;

    @Column(name = "application_url", columnDefinition = "TEXT")
    private String applicationUrl;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(name = "documents_required", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> documentsRequired;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}