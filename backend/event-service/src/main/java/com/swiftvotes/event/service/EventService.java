package com.swiftvotes.event.service;

import com.swiftvotes.event.dto.CreateEventRequest;
import com.swiftvotes.event.exception.EventNotFoundException;
import com.swiftvotes.event.exception.InvalidPublishTransitionException;
import com.swiftvotes.event.model.Event;
import com.swiftvotes.event.model.EventStatus;
import com.swiftvotes.event.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Event create(CreateEventRequest request) {
        Event event = new Event();
        event.setName(request.name());
        event.setSlug(request.slug());
        event.setVotingStartAt(request.votingStartAt());
        event.setVotingEndAt(request.votingEndAt());
        event.setStatus(EventStatus.DRAFT);
        return eventRepository.save(event);
    }

    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    public Event findById(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
    }

    public Event publish(UUID id) {
        Event event = findById(id);
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new InvalidPublishTransitionException(id, event.getStatus());
        }
        event.setStatus(EventStatus.PUBLISHED);
        return eventRepository.save(event);
    }
}
