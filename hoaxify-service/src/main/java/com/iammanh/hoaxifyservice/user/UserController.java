package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.shared.ApiError;
import com.iammanh.hoaxifyservice.shared.GenericApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/api/v1/users")
    public ResponseEntity<GenericApiResponse> createUser(@Valid @RequestBody User user) {
        userService.save(user);
        return ResponseEntity
                .created(URI.create("/api/v1/users/1"))
                .body(new GenericApiResponse("User saved"));
    }

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