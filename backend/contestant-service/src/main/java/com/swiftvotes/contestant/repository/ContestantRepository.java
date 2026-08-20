package com.swiftvotes.contestant.repository;

import com.swiftvotes.contestant.model.Contestant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContestantRepository extends JpaRepository<Contestant, UUID> {

    List<Contestant> findByEventId(UUID eventId);
}
