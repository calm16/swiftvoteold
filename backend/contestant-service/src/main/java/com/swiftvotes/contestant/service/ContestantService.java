package com.swiftvotes.contestant.service;

import com.swiftvotes.contestant.dto.CreateContestantRequest;
import com.swiftvotes.contestant.exception.ContestantNotFoundException;
import com.swiftvotes.contestant.exception.DuplicateContestantCodeException;
import com.swiftvotes.contestant.exception.InvalidStatusTransitionException;
import com.swiftvotes.contestant.model.Contestant;
import com.swiftvotes.contestant.model.ContestantStatus;
import com.swiftvotes.contestant.repository.ContestantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ContestantService {

    private final ContestantRepository contestantRepository;

    public ContestantService(ContestantRepository contestantRepository) {
        this.contestantRepository = contestantRepository;
    }

    public Contestant nominate(CreateContestantRequest request) {
        boolean duplicate = contestantRepository.findByEventId(request.eventId()).stream()
                .anyMatch(c -> c.getCode().equalsIgnoreCase(request.code()));
        if (duplicate) {
            throw new DuplicateContestantCodeException(request.eventId(), request.code());
        }

        Contestant contestant = new Contestant();
        contestant.setEventId(request.eventId());
        contestant.setName(request.name());
        contestant.setCode(request.code());
        contestant.setBio(request.bio());
        contestant.setStatus(ContestantStatus.PENDING);
        return contestantRepository.save(contestant);
    }

    public List<Contestant> findAll(UUID eventId) {
        if (eventId != null) {
            return contestantRepository.findByEventId(eventId);
        }
        return contestantRepository.findAll();
    }

    public Contestant findById(UUID id) {
        return contestantRepository.findById(id)
                .orElseThrow(() -> new ContestantNotFoundException(id));
    }

    public Contestant approve(UUID id) {
        Contestant contestant = findById(id);
        if (contestant.getStatus() != ContestantStatus.PENDING) {
            throw new InvalidStatusTransitionException(id, contestant.getStatus(), "approved");
        }
        contestant.setStatus(ContestantStatus.APPROVED);
        return contestantRepository.save(contestant);
    }

    public Contestant reject(UUID id) {
        Contestant contestant = findById(id);
        if (contestant.getStatus() != ContestantStatus.PENDING) {
            throw new InvalidStatusTransitionException(id, contestant.getStatus(), "rejected");
        }
        contestant.setStatus(ContestantStatus.REJECTED);
        return contestantRepository.save(contestant);
    }
}
