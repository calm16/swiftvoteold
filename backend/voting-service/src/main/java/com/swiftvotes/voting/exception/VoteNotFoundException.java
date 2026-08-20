package com.swiftvotes.voting.exception;

import java.util.UUID;

public class VoteNotFoundException extends RuntimeException {

    public VoteNotFoundException(UUID id) {
        super("Vote not found: " + id);
    }
}
