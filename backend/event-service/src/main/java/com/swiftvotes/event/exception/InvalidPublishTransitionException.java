package com.swiftvotes.event.exception;

import com.swiftvotes.event.model.EventStatus;

import java.util.UUID;

public class InvalidPublishTransitionException extends RuntimeException {

    public InvalidPublishTransitionException(UUID id, EventStatus currentStatus) {
        super("Event " + id + " cannot be published from status " + currentStatus + " (must be DRAFT)");
    }
}
