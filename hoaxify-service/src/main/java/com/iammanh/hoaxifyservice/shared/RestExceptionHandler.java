package com.iammanh.hoaxifyservice.shared;

import com.iammanh.hoaxifyservice.error.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException e, HttpServletRequest request) {
        BindingResult bindingResult = e.getBindingResult();
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();

        Map<String, String> validationErrors = new HashMap<>();
        for (FieldError fieldError : fieldErrors)
            validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());

        return ResponseEntity.badRequest()
                .body(ApiError.builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .url(request.getRequestURI())
                        .message("Validation error")
                        .validationErrors(validationErrors)
                        .build()
                );
    }

}
