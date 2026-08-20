package com.swiftvotes.contestant.exception;

import java.util.UUID;

public class DuplicateContestantCodeException extends RuntimeException {

    public DuplicateContestantCodeException(UUID eventId, String code) {
        super("Contestant code '" + code + "' already used for event " + eventId);
    }
}
