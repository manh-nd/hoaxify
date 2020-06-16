package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.shared.GenericApiResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class UserControllerTest {

    private final String API_V1_USERS = "/api/v1/users";

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception {
        userRepository.deleteAll();
    }

    private User createValidUser() {
        User user = new User();
        user.setUsername("test-user");
        user.setDisplayName("test-name");
        user.setPassword("P4ssword");
        return user;
    }

    @Test
    public void postUser_whenUserIsValid_receiveCreated() {
        User user = createValidUser();

        ResponseEntity<Object> response = testRestTemplate.postForEntity(API_V1_USERS, user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    public void postUser_whenUserIsValid_userSavedToDatabase() {
        User user = createValidUser();
        testRestTemplate.postForEntity(API_V1_USERS, user, Object.class);

        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    public void postUser_whenUserIsValid_receiveSuccessMessage() {
        User user = createValidUser();
        ResponseEntity<GenericApiResponse> response = testRestTemplate.postForEntity(API_V1_USERS, user, GenericApiResponse.class);

        assertThat(response.getBody().getMessage()).isNotNull();
    }

    @Test
    public void postUser_whenUserIsValid_passwordIsHashedInDatabase() {
        User user = createValidUser();
        testRestTemplate.postForEntity(API_V1_USERS, user, GenericApiResponse.class);

        User userInDB = userRepository.findAll().get(0);
        assertThat(userInDB.getPassword()).isNotEqualTo(user.getPassword());
    }

    @Test
    public void postUser_whenUserIsValid_receiveLocationHeader() {
        User user = createValidUser();
        ResponseEntity<Object> response = testRestTemplate.postForEntity(API_V1_USERS, user, Object.class);

        List<String> locationUri = response.getHeaders().get("location");
        assertThat(locationUri).isNotEmpty();
    }

}
