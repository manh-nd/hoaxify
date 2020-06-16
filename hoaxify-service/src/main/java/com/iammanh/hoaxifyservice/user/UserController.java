package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.shared.GenericApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/api/v1/users")
    public ResponseEntity<GenericApiResponse> createUser(@RequestBody User user) {
        userService.save(user);
        return ResponseEntity
                .created(URI.create("/api/v1/users/1"))
                .body(new GenericApiResponse("User saved"));
    }
}
