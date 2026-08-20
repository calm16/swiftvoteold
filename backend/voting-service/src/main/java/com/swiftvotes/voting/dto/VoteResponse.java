package com.swiftvotes.voting.dto;

import com.swiftvotes.voting.model.Vote;
import com.swiftvotes.voting.model.VoteStatus;

import java.time.Instant;
import java.util.UUID;

public record VoteResponse(
        UUID id,
        UUID eventId,
        UUID contestantId,
        String voterEmail,
        int amountMinor,
        String currency,
        VoteStatus status,
        Instant createdAt,
        Instant updatedAt
) {

    public static VoteResponse from(Vote vote) {
        return new VoteResponse(
                vote.getId(),
                vote.getEventId(),
                vote.getContestantId(),
                vote.getVoterEmail(),
                vote.getAmountMinor(),
                vote.getCurrency(),
                vote.getStatus(),
                vote.getCreatedAt(),
                vote.getUpdatedAt()
        );
    }
}
