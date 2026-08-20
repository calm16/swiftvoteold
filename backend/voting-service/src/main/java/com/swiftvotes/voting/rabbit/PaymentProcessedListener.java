package com.swiftvotes.voting.rabbit;

import com.swiftvotes.voting.service.VoteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.core.ExchangeTypes;
import org.springframework.stereotype.Component;

@Component
public class PaymentProcessedListener {

    private static final Logger log = LoggerFactory.getLogger(PaymentProcessedListener.class);

    private final VoteService voteService;

    public PaymentProcessedListener(VoteService voteService) {
        this.voteService = voteService;
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "payment.processed.voting-service.queue", durable = "true"),
            exchange = @Exchange(name = "payment.processed", type = ExchangeTypes.FANOUT)
    ))
    public void onPaymentProcessed(PaymentProcessedEvent event) {
        log.info("Received payment.processed for voteId={} status={}", event.voteId(), event.status());
        voteService.applyPaymentResult(event.voteId(), event.status());
    }
}
