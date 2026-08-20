package com.swiftvotes.contestant.dto;

import com.swiftvotes.contestant.model.Contestant;
import com.swiftvotes.contestant.model.ContestantStatus;

import java.time.Instant;
import java.util.UUID;

public record ContestantResponse(
        UUID id,
        UUID eventId,
        String name,
        String code,
        String bio,
        ContestantStatus status,
        Instant createdAt
) {

    public static ContestantResponse from(Contestant contestant) {
        return new ContestantResponse(
                contestant.getId(),
                contestant.getEventId(),
                contestant.getName(),
                contestant.getCode(),
                contestant.getBio(),
                contestant.getStatus(),
                contestant.getCreatedAt()
        );
    }
}
