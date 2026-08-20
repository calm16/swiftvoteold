package com.swiftvotes.voting.client;

import com.swiftvotes.voting.dto.ContestantDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "contestant-service")
public interface ContestantServiceClient {

    @GetMapping("/api/contestants/{id}")
    ContestantDto getContestant(@PathVariable("id") UUID id);
}
