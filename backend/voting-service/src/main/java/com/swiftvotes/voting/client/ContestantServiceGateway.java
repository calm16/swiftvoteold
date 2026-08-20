package com.swiftvotes.voting.client;

import com.swiftvotes.voting.dto.ContestantDto;
import com.swiftvotes.voting.exception.ServiceUnavailableException;
import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ContestantServiceGateway {

    private final ContestantServiceClient contestantServiceClient;

    public ContestantServiceGateway(ContestantServiceClient contestantServiceClient) {
        this.contestantServiceClient = contestantServiceClient;
    }

    @CircuitBreaker(name = "contestantService", fallbackMethod = "fallback")
    @Retry(name = "contestantService", fallbackMethod = "fallback")
    public ContestantDto findContestant(UUID id) {
        try {
            return contestantServiceClient.getContestant(id);
        } catch (FeignException.NotFound ex) {
            return null;
        }
    }

    @SuppressWarnings("unused")
    private ContestantDto fallback(UUID id, Throwable t) {
        throw new ServiceUnavailableException("contestant-service is unavailable", t);
    }
}
