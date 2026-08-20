package com.swiftvotes.voting.controller;

import com.swiftvotes.voting.dto.CreateVoteRequest;
import com.swiftvotes.voting.dto.VoteResponse;
import com.swiftvotes.voting.model.Vote;
import com.swiftvotes.voting.service.VoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public VoteResponse placeVote(@Valid @RequestBody CreateVoteRequest request) {
        Vote vote = voteService.placeVote(request);
        return VoteResponse.from(vote);
    }

    @GetMapping
    public List<VoteResponse> list(@RequestParam(required = false) UUID eventId) {
        return voteService.findAll(eventId).stream()
                .map(VoteResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public VoteResponse getById(@PathVariable UUID id) {
        return VoteResponse.from(voteService.findById(id));
    }
}
