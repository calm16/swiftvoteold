package com.swiftvotes.gateway.filter;

public record TokenClaims(String userId, String email, String role) {
}
