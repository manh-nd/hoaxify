package com.iammanh.hoaxifyservice.utils;

import com.iammanh.hoaxifyservice.hoax.Hoax;
import com.iammanh.hoaxifyservice.user.User;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class TestUtil {
    public static User createValidUser() {
        User user = new User();
        user.setImage("profile.png");
        user.setUsername("test-user");
        user.setDisplayName("test-name");
        user.setPassword("P4ssword");
        return user;
    }

    public static User createValidUser(String username) {
        User user = new User();
        user.setImage("profile.png");
        user.setUsername(username);
        user.setDisplayName("test-name");
        user.setPassword("P4ssword");
        return user;
    }

    public static Hoax createValidHoax() {
        Hoax hoax = new Hoax();
        hoax.setContent("test content for the test hoax");
        return hoax;
    }

    public static String valueOf(String character, int total) {
        return IntStream.rangeClosed(1, total)
                .mapToObj(a -> character)
                .collect(Collectors.joining());
    }
}
