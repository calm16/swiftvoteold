package com.swiftvotes.payment.service;

import com.swiftvotes.payment.config.RabbitConfig;
import com.swiftvotes.payment.exception.PaymentNotFoundException;
import com.swiftvotes.payment.kafka.PaymentProcessedEvent;
import com.swiftvotes.payment.kafka.VotePlacedEvent;
import com.swiftvotes.payment.model.Payment;
import com.swiftvotes.payment.model.PaymentStatus;
import com.swiftvotes.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;

    public PaymentService(PaymentRepository paymentRepository,
                           RabbitTemplate rabbitTemplate) {
        this.paymentRepository = paymentRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public void processVotePlaced(VotePlacedEvent event) {
        log.info("[DUMMY PAYMENT] no real provider — simulating charge for vote {}", event.voteId());

        PaymentStatus status = event.amountMinor() <= 0 ? PaymentStatus.FAILED : PaymentStatus.PAID;

        Payment payment = new Payment();
        payment.setVoteId(event.voteId());
        payment.setAmountMinor(event.amountMinor());
        payment.setCurrency(event.currency());
        payment.setStatus(status);
        payment = paymentRepository.save(payment);

        log.info("[DUMMY PAYMENT] vote {} simulated charge result: {}", event.voteId(), status);

        PaymentProcessedEvent processedEvent = new PaymentProcessedEvent(
                event.voteId(),
                payment.getId(),
                status.name(),
                event.voterEmail(),
                event.amountMinor(),
                event.currency()
        );
        rabbitTemplate.convertAndSend(RabbitConfig.PAYMENT_PROCESSED_EXCHANGE, "", processedEvent);
    }

    public Payment findByVoteId(UUID voteId) {
        return paymentRepository.findByVoteId(voteId)
                .orElseThrow(() -> new PaymentNotFoundException(voteId));
    }
}
