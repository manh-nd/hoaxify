package com.iammanh.hoaxifyservice.user;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class UniqueUsernameValidator implements ConstraintValidator<UniqueUsername, String> {

    UserRepository userRepository;

    public UniqueUsernameValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isValid(String username, ConstraintValidatorContext context) {
        return !userRepository.findByUsername(username).isPresent();
    }

}
