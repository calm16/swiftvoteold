package com.swiftvotes.contestant.controller;

import com.swiftvotes.contestant.dto.ContestantResponse;
import com.swiftvotes.contestant.dto.CreateContestantRequest;
import com.swiftvotes.contestant.model.Contestant;
import com.swiftvotes.contestant.service.ContestantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/api/contestants")
public class ContestantController {

    private final ContestantService contestantService;

    public ContestantController(ContestantService contestantService) {
        this.contestantService = contestantService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContestantResponse nominate(@Valid @RequestBody CreateContestantRequest request) {
        Contestant contestant = contestantService.nominate(request);
        return ContestantResponse.from(contestant);
    }

    @GetMapping
    public List<ContestantResponse> list(@RequestParam(required = false) UUID eventId) {
        return contestantService.findAll(eventId).stream()
                .map(ContestantResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ContestantResponse getById(@PathVariable UUID id) {
        return ContestantResponse.from(contestantService.findById(id));
    }

    @PatchMapping("/{id}/approve")
    public ContestantResponse approve(@PathVariable UUID id) {
        return ContestantResponse.from(contestantService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ContestantResponse reject(@PathVariable UUID id) {
        return ContestantResponse.from(contestantService.reject(id));
    }
}
