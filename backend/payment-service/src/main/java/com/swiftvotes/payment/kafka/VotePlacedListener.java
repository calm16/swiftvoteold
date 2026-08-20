package com.swiftvotes.payment.kafka;

import com.swiftvotes.payment.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class VotePlacedListener {

    private static final Logger log = LoggerFactory.getLogger(VotePlacedListener.class);

    private final PaymentService paymentService;

    public VotePlacedListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @KafkaListener(topics = "vote.placed", groupId = "${spring.kafka.consumer.group-id}")
    public void onVotePlaced(VotePlacedEvent event) {
        log.info("Received vote.placed event for vote {}", event.voteId());
        paymentService.processVotePlaced(event);
    }
}
