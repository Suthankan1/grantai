package com.grantai.controller;

import com.grantai.dto.GrantDetailResponse;
import com.grantai.dto.GrantSearchResponse;
import com.grantai.service.GrantService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/grants")
@RequiredArgsConstructor
public class GrantController {

    private final GrantService grantService;

    @GetMapping("/search")
    public ResponseEntity<GrantSearchResponse> search(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String field,
        @RequestParam(required = false) String country,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) BigDecimal minAmount,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate maxDeadline,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(grantService.search(
            userDetails != null ? userDetails.getUsername() : null,
            q,
            field,
            country,
            type,
            minAmount,
            maxDeadline,
            page,
            size
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrantDetailResponse> getById(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String id
    ) {
        return ResponseEntity.ok(grantService.getById(userDetails != null ? userDetails.getUsername() : null, id));
    }
}