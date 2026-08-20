package com.swiftvotes.voting.client;

import com.swiftvotes.voting.dto.EventDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "event-service")
public interface EventServiceClient {

    @GetMapping("/api/events/{id}")
    EventDto getEvent(@PathVariable("id") UUID id);
}
