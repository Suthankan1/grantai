package com.grantai.controller;

import com.grantai.dto.ProfileUpdateRequest;
import com.grantai.dto.ProfileResponse;
import com.grantai.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * POST /api/profile/photo
     * Upload user profile photo.
     */
    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPhoto(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            // Get original filename and extension
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generate a unique filename to avoid collision
            String filename = UUID.randomUUID().toString() + extension;

            // Define absolute path to save directory
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            File uploadDir = uploadPath.toFile();
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Save the file
            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Construct relative URL
            String relativeUrl = "/uploads/" + filename;

            return ResponseEntity.ok(Map.of("url", relativeUrl));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Could not upload file: " + ex.getMessage()));
        }
    }

    /**
     * PUT /api/profile
     * Update authenticated user's profile (onboarding wizard step 5 submit).
     */
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(profileService.updateProfile(requireUsername(userDetails), request));
    }

    /**
     * GET /api/profile
     * Get authenticated user's profile.
     */
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(profileService.getProfile(requireUsername(userDetails)));
    }

    private String requireUsername(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}
