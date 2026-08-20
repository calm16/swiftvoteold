package com.swiftvotes.auth.security;

import java.util.UUID;

public record TokenClaims(UUID userId, String email, String role) {
}
