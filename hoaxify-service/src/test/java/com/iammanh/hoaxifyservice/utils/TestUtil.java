package com.iammanh.hoaxifyservice.utils;

import com.iammanh.hoaxifyservice.user.User;

public class TestUtil {
    public static User createValidUser() {
        User user = new User();
        user.setUsername("test-user");
        user.setDisplayName("test-name");
        user.setPassword("P4ssword");
        return user;
    }
}
