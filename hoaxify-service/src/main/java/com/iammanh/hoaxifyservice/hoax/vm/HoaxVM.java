package com.iammanh.hoaxifyservice.hoax.vm;

import com.iammanh.hoaxifyservice.hoax.Hoax;
import com.iammanh.hoaxifyservice.user.vm.UserVM;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class HoaxVM {
    private long id;
    private String content;
    private Date timestamp;
    private UserVM user;

    public HoaxVM(Hoax hoax) {
        this.id = hoax.getId();
        this.content = hoax.getContent();
        this.timestamp = hoax.getTimestamp();
        this.user = new UserVM(hoax.getUser());
    }
}
