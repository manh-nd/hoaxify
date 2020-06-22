package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.shared.CurrentUser;
import com.iammanh.hoaxifyservice.user.vm.UserVM;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @PostMapping("/api/v1/login")
    public ResponseEntity<UserVM> handleLogin(@CurrentUser User loggedInUser) {
        return ResponseEntity.ok(new UserVM(loggedInUser));
    }
}
