package com.grantai.repository;

import com.grantai.entity.Grant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface GrantRepository extends JpaRepository<Grant, String> {

    @Query(value = """
        SELECT *
        FROM grants g
        WHERE (:q IS NULL OR :q = '' OR to_tsvector('english',
            coalesce(g.title, '') || ' ' || coalesce(g.provider, '') || ' ' || coalesce(g.description, '') || ' ' || coalesce(g.field, '') || ' ' || coalesce(g.country_name, ''))
            @@ websearch_to_tsquery('english', :q))
          AND (:fieldCsv IS NULL OR :fieldCsv = '' OR lower(g.field) = ANY (string_to_array(:fieldCsv, ',')))
          AND (:countryCsv IS NULL OR :countryCsv = '' OR lower(g.country_name) = ANY (string_to_array(:countryCsv, ',')) OR lower(coalesce(g.country_code, '')) = ANY (string_to_array(:countryCsv, ',')))
          AND (:typeCsv IS NULL OR :typeCsv = '' OR lower(g.grant_type) = ANY (string_to_array(:typeCsv, ',')))
          AND (:minAmount IS NULL OR g.amount >= :minAmount)
          AND (:maxDeadline IS NULL OR g.deadline <= :maxDeadline)
        ORDER BY
          CASE
            WHEN :q IS NULL OR :q = '' THEN 0
            ELSE ts_rank(
              to_tsvector('english',
                coalesce(g.title, '') || ' ' || coalesce(g.provider, '') || ' ' || coalesce(g.description, '') || ' ' || coalesce(g.field, '') || ' ' || coalesce(g.country_name, '')),
              websearch_to_tsquery('english', :q))
          END DESC,
          g.deadline ASC,
          g.updated_at DESC
        """,
        countQuery = """
        SELECT count(*)
        FROM grants g
        WHERE (:q IS NULL OR :q = '' OR to_tsvector('english',
            coalesce(g.title, '') || ' ' || coalesce(g.provider, '') || ' ' || coalesce(g.description, '') || ' ' || coalesce(g.field, '') || ' ' || coalesce(g.country_name, ''))
            @@ websearch_to_tsquery('english', :q))
          AND (:fieldCsv IS NULL OR :fieldCsv = '' OR lower(g.field) = ANY (string_to_array(:fieldCsv, ',')))
          AND (:countryCsv IS NULL OR :countryCsv = '' OR lower(g.country_name) = ANY (string_to_array(:countryCsv, ',')) OR lower(coalesce(g.country_code, '')) = ANY (string_to_array(:countryCsv, ',')))
          AND (:typeCsv IS NULL OR :typeCsv = '' OR lower(g.grant_type) = ANY (string_to_array(:typeCsv, ',')))
          AND (:minAmount IS NULL OR g.amount >= :minAmount)
          AND (:maxDeadline IS NULL OR g.deadline <= :maxDeadline)
        """,
        nativeQuery = true)
    Page<Grant> search(
        @Param("q") String q,
        @Param("fieldCsv") String fieldCsv,
        @Param("countryCsv") String countryCsv,
        @Param("typeCsv") String typeCsv,
        @Param("minAmount") BigDecimal minAmount,
        @Param("maxDeadline") LocalDate maxDeadline,
        Pageable pageable
    );

    @Query(value = "SELECT * FROM grants g WHERE (:q IS NULL OR :q = '' OR lower(g.title) LIKE lower(concat('%', :q, '%')) OR lower(g.description) LIKE lower(concat('%', :q, '%'))) AND (:fieldCsv IS NULL OR :fieldCsv = '' OR lower(g.field) = ANY (string_to_array(:fieldCsv, ','))) AND (:countryCsv IS NULL OR :countryCsv = '' OR lower(g.country_name) = ANY (string_to_array(:countryCsv, ','))) AND (:typeCsv IS NULL OR :typeCsv = '' OR lower(g.grant_type) = ANY (string_to_array(:typeCsv, ','))) AND (:minAmount IS NULL OR g.amount >= :minAmount) AND (:maxDeadline IS NULL OR g.deadline <= :maxDeadline) ORDER BY g.deadline ASC, g.updated_at DESC", countQuery = "SELECT count(*) FROM grants g WHERE (:q IS NULL OR :q = '' OR lower(g.title) LIKE lower(concat('%', :q, '%')))", nativeQuery = true)
    Page<Grant> searchFallback(@Param("q") String q, @Param("fieldCsv") String fieldCsv, @Param("countryCsv") String countryCsv, @Param("typeCsv") String typeCsv, @Param("minAmount") BigDecimal minAmount, @Param("maxDeadline") LocalDate maxDeadline, Pageable pageable);
}