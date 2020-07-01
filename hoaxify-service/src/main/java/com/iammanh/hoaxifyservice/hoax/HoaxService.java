package com.iammanh.hoaxifyservice.hoax;

import com.iammanh.hoaxifyservice.user.User;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class HoaxService {

    private final HoaxRepository hoaxRepository;

    public HoaxService(HoaxRepository hoaxRepository) {
        this.hoaxRepository = hoaxRepository;
    }

    public void saveHoax(Hoax hoax, User user) {
        hoax.setTimestamp(new Date());
        hoax.setUser(user);
        hoaxRepository.save(hoax);
    }
}
