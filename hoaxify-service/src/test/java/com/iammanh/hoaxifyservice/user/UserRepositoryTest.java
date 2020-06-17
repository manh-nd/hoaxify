package com.iammanh.hoaxifyservice.user;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    TestEntityManager testEntityManager;

    @Autowired
    UserRepository userRepository;

    @Test
    public void findByUsername_whenUsernameExists_returnsUser() {
        User user = new User();

        user.setUsername("test-user");
        user.setPassword("P4ssword");
        user.setDisplayName("test-name");

        testEntityManager.persist(user);

        User inDB = userRepository.findByUsername("test-user");

        assertThat(inDB.getUsername()).isNotNull();
    }

    @Test
    public void findByUsername_whenUserDoesNotExist_returnsNull() {
        User inDB = userRepository.findByUsername("nonexistinguser");
        assertThat(inDB).isNull();
    }
}
