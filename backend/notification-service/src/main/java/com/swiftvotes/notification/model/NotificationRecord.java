package com.swiftvotes.notification.model;

import java.time.Instant;
import java.util.UUID;

public record NotificationRecord(
        String voterEmail,
        UUID voteId,
        String status,
        Instant sentAt
) {
}
