package com.swiftvotes.payment.exception;

import java.util.UUID;

public class PaymentNotFoundException extends RuntimeException {

    public PaymentNotFoundException(UUID voteId) {
        super("Payment not yet processed for vote: " + voteId);
    }
}
