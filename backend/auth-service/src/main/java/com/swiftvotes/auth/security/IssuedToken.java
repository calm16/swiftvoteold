package com.swiftvotes.auth.security;

import java.time.Instant;

public record IssuedToken(String token, Instant expiresAt) {
}
