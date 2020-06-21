package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.error.ApiError;
import com.iammanh.hoaxifyservice.shared.GenericApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/api/v1/users")
    public ResponseEntity<GenericApiResponse> createUser(@Valid @RequestBody User user) {
        userService.save(user);
        return ResponseEntity
                .created(URI.create("/api/v1/users/" + user.getId()))
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
