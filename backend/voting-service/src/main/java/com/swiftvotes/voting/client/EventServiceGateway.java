package com.swiftvotes.voting.client;

import com.swiftvotes.voting.dto.EventDto;
import com.swiftvotes.voting.exception.ServiceUnavailableException;
import feign.FeignException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class EventServiceGateway {

    private final EventServiceClient eventServiceClient;

    public EventServiceGateway(EventServiceClient eventServiceClient) {
        this.eventServiceClient = eventServiceClient;
    }

    @CircuitBreaker(name = "eventService", fallbackMethod = "fallback")
    @Retry(name = "eventService", fallbackMethod = "fallback")
    public EventDto findEvent(UUID id) {
        try {
            return eventServiceClient.getEvent(id);
        } catch (FeignException.NotFound ex) {
            return null;
        }
    }

    @SuppressWarnings("unused")
    private EventDto fallback(UUID id, Throwable t) {
        throw new ServiceUnavailableException("event-service is unavailable", t);
    }
}
