package com.swiftvotes.voting.dto;

import java.time.Instant;
import java.util.UUID;

public record EventDto(
        UUID id,
        String name,
        String slug,
        String status,
        Instant votingStartAt,
        Instant votingEndAt
) {
}
