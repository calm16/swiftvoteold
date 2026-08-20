package com.swiftvotes.voting.rabbit;

import java.util.UUID;

public record PaymentProcessedEvent(
        UUID voteId,
        UUID paymentId,
        String status,
        String voterEmail,
        int amountMinor,
        String currency
) {
}
