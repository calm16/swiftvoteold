package com.swiftvotes.voting.service;

import com.swiftvotes.voting.client.ContestantServiceGateway;
import com.swiftvotes.voting.client.EventServiceGateway;
import com.swiftvotes.voting.dto.ContestantDto;
import com.swiftvotes.voting.dto.CreateVoteRequest;
import com.swiftvotes.voting.dto.EventDto;
import com.swiftvotes.voting.exception.VoteNotFoundException;
import com.swiftvotes.voting.exception.VoteValidationException;
import com.swiftvotes.voting.kafka.VotePlacedEvent;
import com.swiftvotes.voting.kafka.VotePlacedProducer;
import com.swiftvotes.voting.model.Vote;
import com.swiftvotes.voting.model.VoteStatus;
import com.swiftvotes.voting.repository.VoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VoteService {

    private static final Logger log = LoggerFactory.getLogger(VoteService.class);
    private static final String EVENT_PUBLISHED_STATUS = "PUBLISHED";
    private static final String CONTESTANT_APPROVED_STATUS = "APPROVED";

    private final VoteRepository voteRepository;
    private final EventServiceGateway eventServiceGateway;
    private final ContestantServiceGateway contestantServiceGateway;
    private final VotePlacedProducer votePlacedProducer;

    public VoteService(VoteRepository voteRepository,
                        EventServiceGateway eventServiceGateway,
                        ContestantServiceGateway contestantServiceGateway,
                        VotePlacedProducer votePlacedProducer) {
        this.voteRepository = voteRepository;
        this.eventServiceGateway = eventServiceGateway;
        this.contestantServiceGateway = contestantServiceGateway;
        this.votePlacedProducer = votePlacedProducer;
    }

    @Transactional
    public Vote placeVote(CreateVoteRequest request) {
        EventDto event = eventServiceGateway.findEvent(request.eventId());
        if (event == null) {
            throw new VoteValidationException("Event does not exist: " + request.eventId());
        }
        if (!EVENT_PUBLISHED_STATUS.equalsIgnoreCase(event.status())) {
            throw new VoteValidationException("Event is not PUBLISHED: " + request.eventId());
        }

        ContestantDto contestant = contestantServiceGateway.findContestant(request.contestantId());
        if (contestant == null) {
            throw new VoteValidationException("Contestant does not exist: " + request.contestantId());
        }
        if (!CONTESTANT_APPROVED_STATUS.equalsIgnoreCase(contestant.status())) {
            throw new VoteValidationException("Contestant is not APPROVED: " + request.contestantId());
        }
        if (!contestant.eventId().equals(request.eventId())) {
            throw new VoteValidationException("Contestant " + request.contestantId()
                    + " does not belong to event " + request.eventId());
        }

        Vote vote = new Vote();
        vote.setEventId(request.eventId());
        vote.setContestantId(request.contestantId());
        vote.setVoterEmail(request.voterEmail());
        vote.setAmountMinor(request.amountMinor());
        vote.setCurrency("NGN");
        vote.setStatus(VoteStatus.PENDING);
        vote = voteRepository.save(vote);

        votePlacedProducer.publish(new VotePlacedEvent(
                vote.getId(),
                vote.getEventId(),
                vote.getContestantId(),
                vote.getVoterEmail(),
                vote.getAmountMinor(),
                vote.getCurrency()
        ));

        return vote;
    }

    public List<Vote> findAll(UUID eventId) {
        if (eventId != null) {
            return voteRepository.findByEventId(eventId);
        }
        return voteRepository.findAll();
    }

    public Vote findById(UUID id) {
        return voteRepository.findById(id)
                .orElseThrow(() -> new VoteNotFoundException(id));
    }

    @Transactional
    public void applyPaymentResult(UUID voteId, String paymentStatus) {
        Optional<Vote> maybeVote = voteRepository.findById(voteId);
        if (maybeVote.isEmpty()) {
            log.warn("Received payment.processed for unknown voteId={}", voteId);
            return;
        }
        Vote vote = maybeVote.get();
        VoteStatus newStatus = "PAID".equalsIgnoreCase(paymentStatus) ? VoteStatus.PAID : VoteStatus.FAILED;
        vote.setStatus(newStatus);
        voteRepository.save(vote);
        log.info("Vote {} updated to status {}", voteId, newStatus);
    }
}
