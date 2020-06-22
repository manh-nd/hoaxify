package com.iammanh.hoaxifyservice.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User save(User user) {
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        userRepository.save(user);
        return user;
    }

    public Page<User> getUsers(User loggedInUser, Pageable pageable) {
        return loggedInUser == null
                ? userRepository.findAll(pageable)
                : userRepository.findByUsernameNot(loggedInUser.getUsername(), pageable);
    }
}
