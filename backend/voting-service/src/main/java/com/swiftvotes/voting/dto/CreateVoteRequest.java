package com.swiftvotes.voting.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record CreateVoteRequest(
        @NotNull UUID eventId,
        @NotNull UUID contestantId,
        @NotNull @Email String voterEmail,
        @NotNull @Positive Integer amountMinor
) {
}
