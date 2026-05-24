package com.grantai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GrantAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(GrantAiApplication.class, args);
    }
}
