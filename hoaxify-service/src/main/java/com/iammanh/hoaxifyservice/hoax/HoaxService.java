package com.iammanh.hoaxifyservice.hoax;

import com.iammanh.hoaxifyservice.user.User;
import com.iammanh.hoaxifyservice.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class HoaxService {

    private final HoaxRepository hoaxRepository;
    private final UserService userService;

    public HoaxService(HoaxRepository hoaxRepository, UserService userService) {
        this.hoaxRepository = hoaxRepository;
        this.userService = userService;
    }

    public Hoax saveHoax(Hoax hoax, User user) {
        hoax.setTimestamp(new Date());
        hoax.setUser(user);
        hoaxRepository.save(hoax);
        return hoax;
    }

    public Page<Hoax> findAll(Pageable pageable) {
        return hoaxRepository.findAll(pageable);
    }

    public Page<Hoax> getHoaxesOfUser(String username, Pageable pageable) {
        User user = userService.getUserByUsername(username);
        return hoaxRepository.findByUser(user, pageable);
    }
}
