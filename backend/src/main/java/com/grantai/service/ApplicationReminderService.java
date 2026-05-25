package com.grantai.service;

import com.grantai.entity.Grant;
import com.grantai.entity.TrackerEntry;
import com.grantai.entity.User;
import com.grantai.entity.UserProfile;
import com.grantai.repository.TrackerRepository;
import com.grantai.repository.UserProfileRepository;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationReminderService {

    private final TrackerRepository trackerRepository;
    private final UserProfileRepository userProfileRepository;

    @Value("${sendgrid.api-key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email:no-reply@grantai.com}")
    private String sendGridFromEmail;

    /**
     * Runs daily at 9:00 AM to scan tracker entries and notify users.
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDailyReminders() {
        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            log.info("SendGrid API key not configured — skipping reminder job");
            return;
        }

        log.info("Starting daily application deadline reminder scan...");

        LocalDate today = LocalDate.now();
        LocalDate in1Day = today.plusDays(1);
        LocalDate in3Days = today.plusDays(3);
        LocalDate in7Days = today.plusDays(7);

        List<LocalDate> targetDates = List.of(in1Day, in3Days, in7Days);
        List<String> excludedStatuses = List.of("Won", "Rejected");

        List<TrackerEntry> entries = trackerRepository.findByStatusNotInAndGrant_DeadlineIn(excludedStatuses, targetDates);

        if (entries.isEmpty()) {
            log.info("No applications with deadlines in 7, 3, or 1 days found.");
            return;
        }

        log.info("Found {} application(s) requiring a deadline reminder.", entries.size());

        for (TrackerEntry entry : entries) {
            long daysLeft = ChronoUnit.DAYS.between(today, entry.getGrant().getDeadline());

            boolean emailRemindersEnabled = userProfileRepository.findByUserId(entry.getUser().getId())
                .map(UserProfile::isEmailReminders)
                .orElse(true);

            if (!emailRemindersEnabled) {
                log.info("Skipping deadline reminder for user {} - email reminders disabled", entry.getUser().getEmail());
                continue;
            }

            try {
                sendEmail(entry, daysLeft);
            } catch (Exception e) {
                log.error("Error sending reminder email for tracker entry ID: {}: {}", entry.getId(), e.getMessage());
            }
        }
    }

    private void sendEmail(TrackerEntry entry, long daysLeft) throws IOException {
        User user = entry.getUser();
        Grant grant = entry.getGrant();

        String recipientEmail = user.getEmail();
        String recipientName = user.getFullName() != null ? user.getFullName() : "GrantAI Scholar";
        String grantTitle = grant.getTitle();
        String providerName = grant.getProvider();

        String subject = String.format("Action Required: Only %d %s left for %s!", 
            daysLeft, 
            daysLeft == 1 ? "day" : "days", 
            grantTitle
        );

        long daysUntilDeadline = daysLeft;
        String html = """
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #6C47FF;">⏰ Deadline Reminder — %s</h2>
              <p>Your application for <strong>%s</strong> (offered by %s) is due in <strong>%d day(s)</strong>.</p>
              <a href="https://grantai.com/tracker" style="background:#6C47FF;color:#fff;padding:12px 24px;
                 border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">
                Open Application Tracker
              </a>
              <hr style="margin-top:32px;border:none;border-top:1px solid #eee;">
              <p style="font-size:11px;color:#999;">
                You received this because you track applications on GrantAI. 
                <a href="https://grantai.com/settings/notifications">Unsubscribe</a>
              </p>
            </div>
          """.formatted(grantTitle, grantTitle, providerName, daysUntilDeadline);

        if (sendGridApiKey == null || sendGridApiKey.trim().isEmpty()) {
            log.info("[MOCK EMAIL] SendGrid API Key not configured. Simulating email dispatch:");
            log.info("  From: {}", sendGridFromEmail);
            log.info("  To: {} ({})", recipientEmail, recipientName);
            log.info("  Subject: {}", subject);
            log.info("  Days Left: {}", daysLeft);
            log.info("  HTML Body Preview: {}", html.substring(0, Math.min(html.length(), 200)) + "...");
            return;
        }

        Email from = new Email(sendGridFromEmail);
        Email to = new Email(recipientEmail);
        Content content = new Content("text/html", html);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info("Deadline reminder email successfully sent to {}. SendGrid Response Code: {}", recipientEmail, response.getStatusCode());
        } catch (IOException ex) {
            log.error("Failed to send SendGrid email to {}: {}", recipientEmail, ex.getMessage());
            throw ex;
        }
    }
}
