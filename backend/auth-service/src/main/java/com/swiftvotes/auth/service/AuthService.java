package com.swiftvotes.auth.service;

import com.swiftvotes.auth.dto.LoginRequest;
import com.swiftvotes.auth.dto.LoginResponse;
import com.swiftvotes.auth.dto.RegisterRequest;
import com.swiftvotes.auth.dto.UserResponse;
import com.swiftvotes.auth.model.Role;
import com.swiftvotes.auth.model.User;
import com.swiftvotes.auth.repository.UserRepository;
import com.swiftvotes.auth.security.InvalidTokenException;
import com.swiftvotes.auth.security.IssuedToken;
import com.swiftvotes.auth.security.JwtService;
import com.swiftvotes.auth.security.TokenClaims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException(request.email());
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(Role.VOTER);

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        IssuedToken issuedToken = jwtService.issueToken(user);
        return new LoginResponse(issuedToken.token(), issuedToken.expiresAt());
    }

    public UserResponse me(String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        TokenClaims claims = jwtService.verify(token);

        User user = userRepository.findByEmail(claims.email())
                .orElseThrow(() -> new InvalidTokenException("User referenced by token no longer exists"));

        return UserResponse.from(user);
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new InvalidTokenException("Missing or malformed Authorization header");
        }
        return authorizationHeader.substring("Bearer ".length()).trim();
    }
}
