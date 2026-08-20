package com.swiftvotes.contestant.exception;

import com.swiftvotes.contestant.model.ContestantStatus;

import java.util.UUID;

public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(UUID id, ContestantStatus currentStatus, String attemptedAction) {
        super("Contestant " + id + " cannot be " + attemptedAction + " from status " + currentStatus
                + " (must be PENDING)");
    }
}
