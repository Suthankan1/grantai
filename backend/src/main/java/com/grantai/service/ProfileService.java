package com.grantai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grantai.dto.ProfileUpdateRequest;
import com.grantai.dto.ProfileResponse;
import com.grantai.dto.NotificationSettingsDto;
import com.grantai.entity.User;
import com.grantai.entity.UserProfile;
import com.grantai.repository.UserProfileRepository;
import com.grantai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public ProfileResponse updateProfile(String userEmail, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
            .orElse(UserProfile.builder().user(user).build());

        // Step 1: Personal Info
        if (request.fullName() != null) {
            user.setFullName(request.fullName().trim());
        }
        if (request.country() != null) {
            profile.setCountry(request.country());
        }
        if (request.profilePhotoUrl() != null) {
            profile.setProfilePhotoUrl(request.profilePhotoUrl());
        }

        // Step 2: Academic
        if (request.university() != null) {
            profile.setUniversity(request.university());
        }
        if (request.degreeLevel() != null) {
            try {
                profile.setDegreeLevel(UserProfile.DegreeLevel.valueOf(request.degreeLevel().toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid degree level: {}", request.degreeLevel());
            }
        }
        if (request.fieldOfStudy() != null) {
            profile.setFieldOfStudy(request.fieldOfStudy());
        }
        if (request.graduationYear() != null) {
            profile.setGraduationYear(request.graduationYear());
        }
        if (request.gpa() != null) {
            profile.setGpa(request.gpa());
        }

        // Step 3: Research Interests
        if (request.researchInterests() != null) {
            profile.setResearchInterests(toJson(request.researchInterests()));
        }

        // Step 4: Grant Preferences
        if (request.grantTypes() != null) {
            profile.setGrantTypes(toJson(request.grantTypes()));
        }
        if (request.preferredCountries() != null) {
            profile.setPreferredCountries(toJson(request.preferredCountries()));
        }
        if (request.minGrantAmount() != null) {
            profile.setMinGrantAmount(request.minGrantAmount());
        }
        if (request.deadlinePreference() != null) {
            try {
                profile.setDeadlinePreference(
                    UserProfile.DeadlinePreference.valueOf(request.deadlinePreference().toUpperCase())
                );
            } catch (IllegalArgumentException e) {
                log.warn("Invalid deadline preference: {}", request.deadlinePreference());
            }
        }

        userRepository.save(user);
        UserProfile saved = profileRepository.save(profile);

        // Mark profile as complete if all required steps filled
        boolean complete = isProfileComplete(saved, user);
        if (complete && !user.isProfileComplete()) {
            user.setProfileComplete(true);
            userRepository.save(user);
        }

        return toResponse(user, saved);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
            .orElseGet(() -> UserProfile.builder().user(user).build());

        return toResponse(user, profile);
    }

    private boolean isProfileComplete(UserProfile profile, User user) {
        return user.getFullName() != null && !user.getFullName().isBlank()
            && profile.getCountry() != null
            && profile.getUniversity() != null
            && profile.getDegreeLevel() != null
            && profile.getFieldOfStudy() != null
            && profile.getResearchInterests() != null
            && profile.getGrantTypes() != null;
    }

    private String toJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> fromJson(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(value, objectMapper.getTypeFactory()
                .constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private ProfileResponse toResponse(User user, UserProfile profile) {
        return new ProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            profile.getCountry(),
            profile.getProfilePhotoUrl(),
            profile.getUniversity(),
            profile.getDegreeLevel() != null ? profile.getDegreeLevel().name() : null,
            profile.getFieldOfStudy(),
            profile.getGraduationYear(),
            profile.getGpa(),
            fromJson(profile.getResearchInterests()),
            fromJson(profile.getGrantTypes()),
            fromJson(profile.getPreferredCountries()),
            profile.getMinGrantAmount(),
            profile.getDeadlinePreference() != null ? profile.getDeadlinePreference().name() : null,
            user.isProfileComplete()
        );
    }

    @Transactional
    public NotificationSettingsDto updateNotificationSettings(String userEmail, NotificationSettingsDto request) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
            .orElse(UserProfile.builder().user(user).build());

        profile.setEmailReminders(request.emailReminders());
        profileRepository.save(profile);

        return new NotificationSettingsDto(profile.isEmailReminders());
    }

    @Transactional(readOnly = true)
    public NotificationSettingsDto getNotificationSettings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
            .orElseGet(() -> UserProfile.builder().user(user).build());

        return new NotificationSettingsDto(profile.isEmailReminders());
    }
}
