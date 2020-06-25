package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.error.NotFoundException;
import com.iammanh.hoaxifyservice.file.FileService;
import com.iammanh.hoaxifyservice.user.vm.UserUpdateVM;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileService fileService;

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

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(username + " not found"));
    }

    public User update(Long id, UserUpdateVM userUpdateVM) {
        User user = userRepository.getOne(id);
        user.setDisplayName(userUpdateVM.getDisplayName());
        String userUpdateVMImage = userUpdateVM.getImage();
        if (userUpdateVMImage != null) {
            try {
                String saveImageName = fileService.saveProfileImage(userUpdateVMImage);
                user.setImage(saveImageName);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        userRepository.save(user);
        return user;
    }
}
