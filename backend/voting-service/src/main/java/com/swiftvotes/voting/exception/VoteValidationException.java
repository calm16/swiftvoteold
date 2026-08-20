package com.swiftvotes.voting.exception;

public class VoteValidationException extends RuntimeException {

    public VoteValidationException(String message) {
        super(message);
    }
}
