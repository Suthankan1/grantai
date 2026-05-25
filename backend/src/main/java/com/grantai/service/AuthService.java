package com.grantai.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.grantai.config.JwtProperties;
import com.grantai.dto.AuthResponse;
import com.grantai.dto.GoogleAuthRequest;
import com.grantai.dto.LoginRequest;
import com.grantai.dto.RegisterRequest;
import com.grantai.dto.UserDto;
import com.grantai.entity.RefreshToken;
import com.grantai.entity.User;
import com.grantai.repository.RefreshTokenRepository;
import com.grantai.repository.UserRepository;
import com.grantai.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    @Value("${google.client-id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;

    // ── Register ────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = User.builder()
            .email(request.email().toLowerCase().trim())
            .passwordHash(passwordEncoder.encode(request.password()))
            .fullName(request.fullName().trim())
            .role(User.Role.USER)
            .build();

        user = userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())
            .authorities("ROLE_USER")
            .build();

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshTokenValue = jwtUtil.generateRefreshToken(userDetails);

        saveRefreshToken(user, refreshTokenValue);
        setAuthCookies(response, accessToken, refreshTokenValue);

        log.info("New user registered: {}", user.getEmail());
        return new AuthResponse(toDto(user), accessToken, refreshTokenValue, "Registration successful");
    }

    // ── Login ────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.email().toLowerCase().trim(),
                    request.password()
                )
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
            .orElseThrow(() -> new BadCredentialsException("User not found."));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())
            .authorities("ROLE_" + user.getRole().name())
            .build();

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshTokenValue = jwtUtil.generateRefreshToken(userDetails);

        // Revoke all old refresh tokens for this user
        refreshTokenRepository.revokeAllByUser(user);
        saveRefreshToken(user, refreshTokenValue);
        setAuthCookies(response, accessToken, refreshTokenValue);

        log.info("User logged in: {}", user.getEmail());
        return new AuthResponse(toDto(user), accessToken, refreshTokenValue, "Login successful");
    }

    // ── Google OAuth ─────────────────────────────────────────────────

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request, HttpServletResponse response) {
        // 1. Verify the Google ID token with Google's servers
        GoogleIdToken idToken = verifyGoogleToken(request.idToken());
        GoogleIdToken.Payload payload = idToken.getPayload();

        String email = payload.getEmail().toLowerCase().trim();
        String name  = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // 2. Find existing user or create a new one (no password needed)
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                .email(email)
                // Store a random hash — Google users never use password login
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(name != null ? name : email)
                .role(User.Role.USER)
                .build();
            log.info("New Google OAuth user created: {}", email);
            return userRepository.save(newUser);
        });

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())
            .authorities("ROLE_" + user.getRole().name())
            .build();

        String accessToken      = jwtUtil.generateAccessToken(userDetails);
        String refreshTokenValue = jwtUtil.generateRefreshToken(userDetails);

        // Revoke old refresh tokens, issue new ones
        refreshTokenRepository.revokeAllByUser(user);
        saveRefreshToken(user, refreshTokenValue);
        setAuthCookies(response, accessToken, refreshTokenValue);

        log.info("Google OAuth sign-in: {}", email);
        return new AuthResponse(toDto(user), accessToken, refreshTokenValue, "Google sign-in successful");
    }

    private GoogleIdToken verifyGoogleToken(String tokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

            GoogleIdToken idToken = verifier.verify(tokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid or expired Google token.");
            }
            return idToken;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token verification failed", e);
            throw new IllegalArgumentException("Google authentication failed. Please try again.");
        }
    }

    // ── Refresh ──────────────────────────────────────────────────────

    @Transactional
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookieValue(request, "refresh_token");
        if (refreshTokenValue == null) {
            throw new IllegalArgumentException("Refresh token not found.");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token."));

        if (!storedToken.isValid()) {
            throw new IllegalArgumentException("Refresh token expired or revoked. Please log in again.");
        }

        User user = storedToken.getUser();

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())
            .authorities("ROLE_" + user.getRole().name())
            .build();

        // Rotate: revoke old, issue new
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
        saveRefreshToken(user, newRefreshToken);
        setAuthCookies(response, newAccessToken, newRefreshToken);

        return new AuthResponse(toDto(user), newAccessToken, newRefreshToken, "Token refreshed");
    }

    // ── Logout ───────────────────────────────────────────────────────

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookieValue(request, "refresh_token");

        if (refreshTokenValue != null) {
            refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(token -> {
                    refreshTokenRepository.revokeAllByUser(token.getUser());
                });
        }

        clearAuthCookies(response);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private void saveRefreshToken(User user, String tokenValue) {
        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .token(tokenValue)
            .expiresAt(Instant.now().plusMillis(jwtProperties.refreshTokenExpiryMs()))
            .createdAt(Instant.now())
            .build();
        refreshTokenRepository.save(refreshToken);
    }

    private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        addCookie(response, "access_token", accessToken,
            (int) (jwtProperties.accessTokenExpiryMs() / 1000));
        addCookie(response, "refresh_token", refreshToken,
            (int) (jwtProperties.refreshTokenExpiryMs() / 1000));
    }

    private void clearAuthCookies(HttpServletResponse response) {
        addCookie(response, "access_token", "", 0);
        addCookie(response, "refresh_token", "", 0);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(jwtProperties.secureCookie())
            .path("/")
            .maxAge(maxAgeSeconds)
            .sameSite(jwtProperties.secureCookie() ? "Strict" : "Lax");

        if (jwtProperties.cookieDomain() != null && !jwtProperties.cookieDomain().isBlank()) {
            cookieBuilder.domain(jwtProperties.cookieDomain());
        }

        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
    }

    private String extractCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        return Arrays.stream(cookies)
            .filter(c -> name.equals(c.getName()))
            .map(Cookie::getValue)
            .findFirst()
            .orElse(null);
    }

    private UserDto toDto(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.isProfileComplete()
        );
    }
}
