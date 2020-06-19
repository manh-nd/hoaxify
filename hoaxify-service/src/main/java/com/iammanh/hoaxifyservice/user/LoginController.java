package com.iammanh.hoaxifyservice.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.iammanh.hoaxifyservice.shared.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @PostMapping("/api/v1/login")
    @JsonView(View.Base.class)
    public ResponseEntity<User> handleLogin(@CurrentUser User loggedInUser) {
        return ResponseEntity.ok(loggedInUser);
    }
}
