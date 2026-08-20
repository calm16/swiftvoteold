package com.swiftvotes.event.dto;

import com.swiftvotes.event.model.Event;
import com.swiftvotes.event.model.EventStatus;

import java.time.Instant;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String name,
        String slug,
        Instant votingStartAt,
        Instant votingEndAt,
        EventStatus status,
        Instant createdAt
) {

    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getSlug(),
                event.getVotingStartAt(),
                event.getVotingEndAt(),
                event.getStatus(),
                event.getCreatedAt()
        );
    }
}
