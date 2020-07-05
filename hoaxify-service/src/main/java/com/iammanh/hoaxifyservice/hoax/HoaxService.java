package com.iammanh.hoaxifyservice.hoax;

import com.iammanh.hoaxifyservice.user.User;
import com.iammanh.hoaxifyservice.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Date;
import java.util.List;

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

    public Page<Hoax> getOldHoaxes(Long id, String username, Pageable pageable) {
        Specification<Hoax> spec = Specification.where(idLessThan(id));
        if(username != null) {
            User inDB = userService.getUserByUsername(username);
            spec = spec.and(userIs(inDB));
        }

        return hoaxRepository.findAll(spec, pageable);
    }

    public List<Hoax> getNewHoaxes(Long id, String username, Pageable pageable) {
        Specification<Hoax> spec = Specification.where(idGreaterThan(id));
        if(username != null) {
            User inDB = userService.getUserByUsername(username);
            spec = spec.and(userIs(inDB));
        }

        return hoaxRepository.findAll(spec, pageable.getSort());
    }

    public long getNewHoaxCount(Long id, String username) {
        Specification<Hoax> spec = Specification.where(idGreaterThan(id));
        if(username != null) {
            User inDB = userService.getUserByUsername(username);
            spec = spec.and(userIs(inDB));
        }

        return hoaxRepository.count(spec);
    }

    private Specification<Hoax> userIs(User user) {
        return (Specification<Hoax>) (root, query, builder) -> builder.equal(root.get("user"), user);
    }

    private Specification<Hoax> idLessThan(long id) {
        return (Specification<Hoax>) (root, query, builder) -> builder.lessThan(root.get("id"), id);
    }

    private Specification<Hoax> idGreaterThan(long id) {
        return (Specification<Hoax>) (root, query, builder) -> builder.greaterThan(root.get("id"), id);
    }
}
