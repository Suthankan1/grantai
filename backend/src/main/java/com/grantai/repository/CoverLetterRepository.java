package com.grantai.repository;

import com.grantai.entity.CoverLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoverLetterRepository extends JpaRepository<CoverLetter, String> {
    Optional<CoverLetter> findByIdAndUser_Id(String id, String userId);
    List<CoverLetter> findAllByUser_IdOrderByUpdatedAtDesc(String userId);
}
