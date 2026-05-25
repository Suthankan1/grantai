package com.grantai.service;

import com.grantai.entity.Grant;
import com.grantai.entity.TrackerEntry;
import com.grantai.entity.User;
import com.grantai.entity.UserProfile;
import com.grantai.repository.TrackerRepository;
import com.grantai.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationReminderServiceTest {

    @Mock
    private TrackerRepository trackerRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    private ApplicationReminderService reminderService;

    @BeforeEach
    void setUp() {
        reminderService = new ApplicationReminderService(trackerRepository, userProfileRepository);
        ReflectionTestUtils.setField(reminderService, "sendGridApiKey", "mock-sendgrid-api-key");
        ReflectionTestUtils.setField(reminderService, "sendGridFromEmail", "no-reply@grantai.com");
    }

    @Test
    void testSendDailyReminders_WithEmailRemindersEnabled() {
        User user = new User();
        user.setId("user-1");
        user.setEmail("user1@example.com");

        Grant grant = new Grant();
        grant.setTitle("Test Grant");
        grant.setDeadline(LocalDate.now().plusDays(3));

        TrackerEntry entry = new TrackerEntry();
        entry.setId("entry-1");
        entry.setUser(user);
        entry.setGrant(grant);

        UserProfile profile = new UserProfile();
        profile.setEmailReminders(true);

        when(trackerRepository.findByStatusNotInAndGrant_DeadlineIn(any(), any()))
            .thenReturn(List.of(entry));
        when(userProfileRepository.findByUserId("user-1"))
            .thenReturn(Optional.of(profile));

        reminderService.sendDailyReminders();

        // Verify that it checked the profile
        verify(userProfileRepository, times(1)).findByUserId("user-1");
    }

    @Test
    void testSendDailyReminders_WithEmailRemindersDisabled() {
        User user = new User();
        user.setId("user-2");
        user.setEmail("user2@example.com");

        Grant grant = new Grant();
        grant.setTitle("Test Grant");
        grant.setDeadline(LocalDate.now().plusDays(3));

        TrackerEntry entry = new TrackerEntry();
        entry.setId("entry-2");
        entry.setUser(user);
        entry.setGrant(grant);

        UserProfile profile = new UserProfile();
        profile.setEmailReminders(false);

        when(trackerRepository.findByStatusNotInAndGrant_DeadlineIn(any(), any()))
            .thenReturn(List.of(entry));
        when(userProfileRepository.findByUserId("user-2"))
            .thenReturn(Optional.of(profile));

        reminderService.sendDailyReminders();

        // Verify that it checked the profile
        verify(userProfileRepository, times(1)).findByUserId("user-2");
    }
}
