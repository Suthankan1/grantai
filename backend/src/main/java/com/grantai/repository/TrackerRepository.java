package com.grantai.repository;

import com.grantai.entity.TrackerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrackerRepository extends JpaRepository<TrackerEntry, String> {

    Optional<TrackerEntry> findByIdAndUser_Id(String id, String userId);

    List<TrackerEntry> findAllByUser_Id(String userId);

    Optional<TrackerEntry> findByUser_IdAndGrant_Id(String userId, String grantId);

    List<TrackerEntry> findByStatusNotInAndGrant_DeadlineIn(List<String> statuses, List<LocalDate> deadlines);
}
