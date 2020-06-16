package com.iammanh.hoaxifyservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class HoaxifyServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(HoaxifyServiceApplication.class, args);
	}

}
