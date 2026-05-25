package com.grantai.controller;

import com.grantai.dto.CoverLetterGenerateRequest;
import com.grantai.dto.CoverLetterResponse;
import com.grantai.dto.CoverLetterUpdateRequest;
import com.grantai.service.CoverLetterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/letters")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    @PostMapping(value = "/generate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generate(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CoverLetterGenerateRequest request
    ) {
        return coverLetterService.generate(userDetails.getUsername(), request);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> getById(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String id
    ) {
        return ResponseEntity.ok(coverLetterService.getById(userDetails.getUsername(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> update(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String id,
        @RequestBody CoverLetterUpdateRequest request
    ) {
        return ResponseEntity.ok(coverLetterService.update(userDetails.getUsername(), id, request));
    }

    @GetMapping
    public ResponseEntity<List<CoverLetterResponse>> list(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(coverLetterService.list(userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String id) {
      coverLetterService.delete(userDetails.getUsername(), id);
      return ResponseEntity.noContent().build();
    }
}
