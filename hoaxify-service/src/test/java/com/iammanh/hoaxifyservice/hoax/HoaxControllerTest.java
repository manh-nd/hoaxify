package com.iammanh.hoaxifyservice.hoax;

import com.iammanh.hoaxifyservice.error.ApiError;
import com.iammanh.hoaxifyservice.user.User;
import com.iammanh.hoaxifyservice.user.UserRepository;
import com.iammanh.hoaxifyservice.user.UserService;
import com.iammanh.hoaxifyservice.utils.TestUtil;
import org.assertj.core.api.Assertions;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;

import static com.iammanh.hoaxifyservice.utils.TestUtil.*;
import static org.assertj.core.api.Assertions.*;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class HoaxControllerTest {

    private static final String API_V1_HOAXES = "/api/v1/hoaxes";

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private HoaxRepository hoaxRepository;

    @PersistenceUnit
    EntityManagerFactory entityManagerFactory;

    @After
    public void tearDown()  {
        hoaxRepository.deleteAll();
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate().getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsAuthorized_receiveOk() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsUnauthorized_receiveUnauthorized() {
        userService.save(createValidUser("user1"));
        Hoax hoax = createValidHoax();
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsUnauthorized_receiveApiError() {
        userService.save(createValidUser("user1"));
        Hoax hoax = createValidHoax();
        ResponseEntity<ApiError> response = postHoax(hoax, ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_V1_HOAXES);
    }

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsAuthorized_hoaxSavedToDatabase() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        postHoax(hoax, Object.class);
        assertThat(hoaxRepository.count()).isEqualTo(1);
    }

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsAuthorized_hoaxSavedToDatabaseWithTimestamp() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        postHoax(hoax, Object.class);
        Hoax inDB = hoaxRepository.findAll().get(0);
        assertThat(inDB.getTimestamp()).isNotNull();
    }

    @Test
    public void postHoax_whenHoaxContentIsNullAndUserIsAuthorized_receiveBadRequest() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        hoax.setContent(null);
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postHoax_whenHoaxContentLessThan10CharactersAndUserIsAuthorized_receiveBadRequest() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        hoax.setContent(valueOf("a", 9));
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postHoax_whenHoaxContentIs5000CharactersAndUserIsAuthorized_receiveOK() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        hoax.setContent(valueOf("a", 5000));
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postHoax_whenHoaxContentIsMoreThan5000CharactersAndUserIsAuthorized_receiveBadRequest() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        hoax.setContent(valueOf("a", 5001));
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postHoax_whenHoaxContentIsNullAndUserIsAuthorized_receiveApiErrorWithValidationErrors() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        hoax.setContent(null);
        ResponseEntity<ApiError> response = postHoax(hoax, ApiError.class);
        ApiError apiError = response.getBody();
        assertThat(apiError.getValidationErrors().get("content")).isNotNull();
    }

    @Test
    public void postHoax_whenHoaxContentIsNullAndUserIsAuthorized_hoaxSavedWithAuthorizedUserInfo() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        postHoax(hoax, Object.class);
        Hoax inDB = hoaxRepository.findAll().get(0);
        assertThat(inDB.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postHoax_whenHoaxContentIsNullAndUserIsAuthorized_hoaxCanBeAccessedFromUserEntity() {
        User user = userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        postHoax(hoax, Object.class);

        EntityManager entityManager = entityManagerFactory.createEntityManager();
        User inDB = entityManager.find(User.class, user.getId());
        assertThat(inDB.getHoaxes().size()).isEqualTo(1);
    }

    private <T> ResponseEntity<T> postHoax(Hoax hoax, Class<T> responseType) {
        return testRestTemplate.postForEntity(API_V1_HOAXES, hoax, responseType);
    }
}
