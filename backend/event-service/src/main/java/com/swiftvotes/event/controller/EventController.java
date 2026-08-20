package com.swiftvotes.event.controller;

import com.swiftvotes.event.dto.CreateEventRequest;
import com.swiftvotes.event.dto.EventResponse;
import com.swiftvotes.event.model.Event;
import com.swiftvotes.event.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(@Valid @RequestBody CreateEventRequest request) {
        Event event = eventService.create(request);
        return EventResponse.from(event);
    }

    @GetMapping
    public List<EventResponse> list() {
        return eventService.findAll().stream()
                .map(EventResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable UUID id) {
        return EventResponse.from(eventService.findById(id));
    }

    @PatchMapping("/{id}/publish")
    public EventResponse publish(@PathVariable UUID id) {
        return EventResponse.from(eventService.publish(id));
    }
}
