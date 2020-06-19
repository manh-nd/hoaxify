package com.iammanh.hoaxifyservice.error;

import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.util.Map;

@RestController
public class ErrorHandler implements ErrorController {

    private final ErrorAttributes errorAttributes;

    public ErrorHandler(ErrorAttributes errorAttributes) {
        this.errorAttributes = errorAttributes;
    }

    @RequestMapping("/error")
    public ResponseEntity<ApiError> handleError(WebRequest webRequest) {
        Map<String, Object> errorAttributes = this.errorAttributes.getErrorAttributes(webRequest, true);
        String message = (String) errorAttributes.get("message");
        String url = (String) errorAttributes.get("path");
        int status = (int) errorAttributes.get("status");
        return ResponseEntity
                .status(status)
                .body(ApiError.builder()
                        .message(message)
                        .url(url)
                        .status(status)
                        .build()
                );
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }
}
