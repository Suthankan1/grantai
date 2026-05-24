package com.grantai.service;

import com.grantai.dto.InterviewSessionResponse;
import com.grantai.dto.SaveSessionRequest;
import com.grantai.entity.Grant;
import com.grantai.entity.InterviewSession;
import com.grantai.entity.User;
import com.grantai.repository.GrantRepository;
import com.grantai.repository.InterviewSessionRepository;
import com.grantai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final GrantRepository grantRepository;
    private final AiEngineClient aiEngineClient;

    public String getQuestions(Map<String, Object> grantPayload) {
        return aiEngineClient.fetchInterviewQuestions(grantPayload);
    }

    public String getFeedback(String question, String answer, Map<String, Object> grantPayload) {
        return aiEngineClient.fetchInterviewFeedback(question, answer, grantPayload);
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionResponse> getSessions(String userEmail) {
        User user = requireUser(userEmail);
        return sessionRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public InterviewSessionResponse saveSession(String userEmail, SaveSessionRequest request) {
        User user = requireUser(userEmail);
        Grant grant = grantRepository.findById(request.grantId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grant not found"));

        InterviewSession session = InterviewSession.builder()
            .user(user)
            .grant(grant)
            .questionsJson(request.questionsJson())
            .answersJson(request.answersJson())
            .feedbackJson(request.feedbackJson())
            .avgScore(request.avgScore())
            .build();

        InterviewSession saved = sessionRepository.save(session);
        return toResponse(saved);
    }

    private User requireUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));
    }

    private InterviewSessionResponse toResponse(InterviewSession session) {
        return new InterviewSessionResponse(
            session.getId(),
            session.getGrant().getId(),
            session.getGrant().getTitle(),
            session.getGrant().getProvider(),
            session.getQuestionsJson(),
            session.getAnswersJson(),
            session.getFeedbackJson(),
            session.getAvgScore(),
            session.getCreatedAt()
        );
    }
}
