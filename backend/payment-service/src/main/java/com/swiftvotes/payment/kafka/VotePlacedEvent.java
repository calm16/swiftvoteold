package com.swiftvotes.payment.kafka;

import java.util.UUID;

public record VotePlacedEvent(
        UUID voteId,
        UUID eventId,
        UUID contestantId,
        String voterEmail,
        int amountMinor,
        String currency
) {
}
