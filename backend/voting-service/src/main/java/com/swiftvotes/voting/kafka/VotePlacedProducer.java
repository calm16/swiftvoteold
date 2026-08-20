package com.swiftvotes.voting.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class VotePlacedProducer {

    private static final Logger log = LoggerFactory.getLogger(VotePlacedProducer.class);
    public static final String TOPIC = "vote.placed";

    private final KafkaTemplate<String, VotePlacedEvent> kafkaTemplate;

    public VotePlacedProducer(KafkaTemplate<String, VotePlacedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(VotePlacedEvent event) {
        log.info("Publishing vote.placed for voteId={}", event.voteId());
        kafkaTemplate.send(TOPIC, event.voteId().toString(), event);
    }
}
