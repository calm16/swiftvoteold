package com.swiftvotes.payment.kafka;

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
