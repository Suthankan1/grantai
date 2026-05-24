package com.grantai.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardStatsResponse(
    long totalApplied,
    double winRate,
    int avgMatchScore,
    long grantsBookmarked,
    BigDecimal totalWonAmount,
    BigDecimal totalAppliedAmount,
    List<DeadlineEvent> upcomingDeadlines,
    List<ActivityLog> recentActivities
) {
    public record DeadlineEvent(
        String trackerId,
        String grantId,
        String grantTitle,
        String provider,
        LocalDate deadline,
        long daysLeft
    ) {}

    public record ActivityLog(
        String id,
        String description,
        String timeAgo
    ) {}
}
