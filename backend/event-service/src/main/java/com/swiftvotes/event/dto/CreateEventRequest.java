package com.swiftvotes.event.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record CreateEventRequest(

        @NotBlank(message = "name is required")
        String name,

        @NotBlank(message = "slug is required")
        String slug,

        Instant votingStartAt,

        Instant votingEndAt
) {
}
