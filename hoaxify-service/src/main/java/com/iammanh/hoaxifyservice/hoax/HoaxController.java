package com.iammanh.hoaxifyservice.hoax;

import com.iammanh.hoaxifyservice.hoax.vm.HoaxVM;
import com.iammanh.hoaxifyservice.shared.CurrentUser;
import com.iammanh.hoaxifyservice.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/api/v1")
public class HoaxController {

    private final HoaxService hoaxService;

    public HoaxController(HoaxService hoaxService) {
        this.hoaxService = hoaxService;
    }

    @PostMapping("/hoaxes")
    public ResponseEntity<HoaxVM> createHoax(@Valid @RequestBody Hoax hoax, @CurrentUser User loggedInUser) throws URISyntaxException {
        Hoax savedHoax = hoaxService.saveHoax(hoax, loggedInUser);
        return ResponseEntity
                .created(new URI(String.format("/api/v1/hoaxes/%s", savedHoax.getId())))
                .body(new HoaxVM(savedHoax));
    }

    @GetMapping("/hoaxes")
    public ResponseEntity<Page<HoaxVM>> getHoaxes(Pageable pageable) {
        return ResponseEntity.ok(hoaxService.findAll(pageable).map(HoaxVM::new));
    }

    @GetMapping("/users/{username}/hoaxes")
    public ResponseEntity<Page<HoaxVM>> getHoaxesOfUser(@PathVariable String username, Pageable pageable) {
        Page<Hoax> hoaxesOfUserPage = hoaxService.getHoaxesOfUser(username, pageable);
        return ResponseEntity.ok(hoaxesOfUserPage.map(HoaxVM::new));
    }
}
