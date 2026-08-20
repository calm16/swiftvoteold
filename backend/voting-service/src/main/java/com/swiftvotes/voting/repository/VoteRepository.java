package com.swiftvotes.voting.repository;

import com.swiftvotes.voting.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VoteRepository extends JpaRepository<Vote, UUID> {

    List<Vote> findByEventId(UUID eventId);
}
