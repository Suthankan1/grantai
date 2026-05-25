package com.grantai.service;

import com.grantai.entity.Grant;
import com.grantai.entity.TrackerEntry;
import com.grantai.entity.User;
import com.grantai.repository.TrackerRepository;
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

        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<body style='font-family: Arial, sans-serif; background-color: #05050c; color: #f3f4f6; padding: 20px;'>" +
            "  <div style='max-width: 600px; margin: 0 auto; border: 1px solid #1f2937; background: #080810; border-radius: 12px; padding: 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);'>" +
            "    <h2 style='color: #6c47ff; margin-bottom: 20px; border-bottom: 1px solid #1f2937; padding-bottom: 10px;'>Deadline intelligence Alert</h2>" +
            "    <p>Dear %s,</p>" +
            "    <p>This is a personalized alert from your <strong>GrantAI Application Tracker</strong>.</p>" +
            "    <p>The deadline for your tracked application <strong>%s</strong>, offered by <strong>%s</strong>, is approaching fast:</p>" +
            "    <div style='background-color: %s; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; font-size: 1.2rem; font-weight: bold; color: #ffffff;'>" +
            "      %d %s left (Deadline: %s)" +
            "    </div>" +
            "    <p>Current Application Status: <strong>%s</strong></p>" +
            "    <p>We recommend wrapping up your cover letter and finalizing details to submit before the deadline.</p>" +
            "    <p style='margin-top: 30px;'><a href='http://localhost:3000/tracker' style='display: inline-block; background-color: #6c47ff; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;'>View on Kanban Board</a></p>" +
            "    <hr style='border: 0; border-top: 1px solid #1f2937; margin: 30px 0;'>" +
            "    <p style='font-size: 0.8rem; color: #9ca3af;'>You are receiving this automated email reminder because you are tracking this grant in GrantAI.</p>" +
            "  </div>" +
            "</body>" +
            "</html>",
            recipientName,
            grantTitle,
            providerName,
            daysLeft == 1 ? "#ef4444" : (daysLeft <= 3 ? "#f59e0b" : "#10b981"),
            daysLeft,
            daysLeft == 1 ? "day" : "days",
            grant.getDeadline().toString(),
            entry.getStatus()
        );

        if (sendGridApiKey == null || sendGridApiKey.trim().isEmpty()) {
            log.info("[MOCK EMAIL] SendGrid API Key not configured. Simulating email dispatch:");
            log.info("  From: {}", sendGridFromEmail);
            log.info("  To: {} ({})", recipientEmail, recipientName);
            log.info("  Subject: {}", subject);
            log.info("  Days Left: {}", daysLeft);
            log.info("  HTML Body Preview: {}", htmlContent.substring(0, Math.min(htmlContent.length(), 200)) + "...");
            return;
        }

        Email from = new Email(sendGridFromEmail);
        Email to = new Email(recipientEmail);
        Content content = new Content("text/html", htmlContent);
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
