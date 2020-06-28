package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.shared.CurrentUser;
import com.iammanh.hoaxifyservice.user.vm.UserVM;
import org.apache.commons.io.FileUtils;
import org.apache.http.HttpResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;

@RestController
public class LoginController {

    @PostMapping("/api/v1/login")
    public ResponseEntity<UserVM> handleLogin(@CurrentUser User loggedInUser) {
        return ResponseEntity.ok(new UserVM(loggedInUser));
    }
}
