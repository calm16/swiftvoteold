package com.swiftvotes.contestant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateContestantRequest(

        @NotNull(message = "eventId is required")
        UUID eventId,

        @NotBlank(message = "name is required")
        String name,

        @NotBlank(message = "code is required")
        String code,

        String bio
) {
}
