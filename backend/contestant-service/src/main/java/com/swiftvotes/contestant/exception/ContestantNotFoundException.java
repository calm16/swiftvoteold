package com.swiftvotes.contestant.exception;

import java.util.UUID;

public class ContestantNotFoundException extends RuntimeException {

    public ContestantNotFoundException(UUID id) {
        super("Contestant not found: " + id);
    }
}
