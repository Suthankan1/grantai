package com.grantai.controller;

import com.grantai.dto.InterviewSessionResponse;
import com.grantai.dto.SaveSessionRequest;
import com.grantai.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/questions")
    @SuppressWarnings("unchecked")
    public ResponseEntity<String> getQuestions(
        @RequestBody Map<String, Object> request
    ) {
        Map<String, Object> grant = (Map<String, Object>) request.get("grant");
        String jsonResponse = interviewService.getQuestions(grant);
        return ResponseEntity.ok()
            .header("Content-Type", "application/json")
            .body(jsonResponse);
    }

    @PostMapping("/feedback")
    @SuppressWarnings("unchecked")
    public ResponseEntity<String> getFeedback(
        @RequestBody Map<String, Object> request
    ) {
        String question = (String) request.get("question");
        String answer = (String) request.get("answer");
        Map<String, Object> grant = (Map<String, Object>) request.get("grant");
        String jsonResponse = interviewService.getFeedback(question, answer, grant);
        return ResponseEntity.ok()
            .header("Content-Type", "application/json")
            .body(jsonResponse);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<InterviewSessionResponse>> getSessions(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<InterviewSessionResponse> sessions = interviewService.getSessions(requireUsername(userDetails));
        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/sessions")
    public ResponseEntity<InterviewSessionResponse> saveSession(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody SaveSessionRequest request
    ) {
        InterviewSessionResponse saved = interviewService.saveSession(requireUsername(userDetails), request);
        return ResponseEntity.ok(saved);
    }

    private String requireUsername(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getUsername();
    }
}
