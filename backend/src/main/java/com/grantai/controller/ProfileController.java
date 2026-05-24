package com.grantai.controller;

import com.grantai.dto.ProfileUpdateRequest;
import com.grantai.dto.ProfileResponse;
import com.grantai.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * PUT /api/profile
     * Update authenticated user's profile (onboarding wizard step 5 submit).
     */
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(profileService.updateProfile(userDetails.getUsername(), request));
    }

    /**
     * GET /api/profile
     * Get authenticated user's profile.
     */
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(profileService.getProfile(userDetails.getUsername()));
    }
}
