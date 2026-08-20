package com.swiftvotes.payment.repository;

import com.swiftvotes.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByVoteId(UUID voteId);
}
