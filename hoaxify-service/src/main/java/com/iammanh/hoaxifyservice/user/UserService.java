package com.iammanh.hoaxifyservice.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    public void save(User user) {
        String encryptedPassword = encoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        userRepository.save(user);
    }
}
