package com.iammanh.hoaxifyservice.shared;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiError {
    private final long timestamp = new Date().getTime();
    private int status;
    private String url;
    private String message;
    private Map<String, String> validationErrors;
}
