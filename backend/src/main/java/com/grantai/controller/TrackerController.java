package com.grantai.controller;

import com.grantai.dto.DashboardStatsResponse;
import com.grantai.dto.TrackerCreateRequest;
import com.grantai.dto.TrackerUpdateRequest;
import com.grantai.dto.TrackerResponse;
import com.grantai.service.TrackerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tracker")
@RequiredArgsConstructor
public class TrackerController {

    private final TrackerService trackerService;

    @GetMapping
    public ResponseEntity<List<TrackerResponse>> list(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(trackerService.list(requireUsername(userDetails)));
    }

    @PostMapping
    public ResponseEntity<TrackerResponse> create(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody TrackerCreateRequest request
    ) {
        return ResponseEntity.ok(trackerService.create(requireUsername(userDetails), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackerResponse> update(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String id,
        @RequestBody TrackerUpdateRequest request
    ) {
        return ResponseEntity.ok(trackerService.update(requireUsername(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String id
    ) {
        trackerService.delete(requireUsername(userDetails), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(trackerService.getStats(requireUsername(userDetails)));
    }

    private String requireUsername(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}
