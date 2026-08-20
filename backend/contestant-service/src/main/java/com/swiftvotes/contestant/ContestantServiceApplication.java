package com.swiftvotes.contestant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ContestantServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContestantServiceApplication.class, args);
    }
}
