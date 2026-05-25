package com.grantai.controller;

import com.grantai.dto.NotificationSettingsDto;
import com.grantai.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final ProfileService profileService;

    @GetMapping("/notifications")
    public ResponseEntity<NotificationSettingsDto> getNotificationSettings(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(profileService.getNotificationSettings(userDetails.getUsername()));
    }

    @PutMapping("/notifications")
    public ResponseEntity<NotificationSettingsDto> updateNotificationSettings(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody NotificationSettingsDto request
    ) {
        return ResponseEntity.ok(profileService.updateNotificationSettings(userDetails.getUsername(), request));
    }
}
