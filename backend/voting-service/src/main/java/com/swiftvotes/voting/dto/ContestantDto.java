package com.swiftvotes.voting.dto;

import java.util.UUID;

public record ContestantDto(
        UUID id,
        UUID eventId,
        String name,
        String code,
        String status
) {
}
