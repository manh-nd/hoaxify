package com.iammanh.hoaxifyservice.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private final Timestamp timestamp = Timestamp.from(Instant.now());
    private int status;
    private String url;
    private String message;
    private Map<String, String> validationErrors;
}
