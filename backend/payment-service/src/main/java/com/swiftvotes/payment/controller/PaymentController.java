package com.swiftvotes.payment.controller;

import com.swiftvotes.payment.dto.PaymentResponse;
import com.swiftvotes.payment.service.PaymentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/{voteId}")
    public PaymentResponse getByVoteId(@PathVariable UUID voteId) {
        return PaymentResponse.from(paymentService.findByVoteId(voteId));
    }
}
