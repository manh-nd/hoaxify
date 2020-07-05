package com.iammanh.hoaxifyservice.hoax;

import com.iammanh.hoaxifyservice.error.ApiError;
import com.iammanh.hoaxifyservice.hoax.vm.HoaxVM;
import com.iammanh.hoaxifyservice.model.TestPage;
import com.iammanh.hoaxifyservice.user.User;
import com.iammanh.hoaxifyservice.user.UserRepository;
import com.iammanh.hoaxifyservice.user.UserService;
import com.iammanh.hoaxifyservice.utils.TestUtil;
import org.assertj.core.api.Assertions;
import org.junit.After;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;

import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static com.iammanh.hoaxifyservice.utils.TestUtil.*;
import static org.assertj.core.api.Assertions.*;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
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

    @Autowired
    private HoaxService hoaxService;

    @PersistenceUnit
    EntityManagerFactory entityManagerFactory;

    @After
    public void tearDown() {
        hoaxRepository.deleteAll();
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate().getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsAuthorized_receiveCreated() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
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
    public void postHoax_whenHoaxContentIs5000CharactersAndUserIsAuthorized_receiveCreated() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        hoax.setContent(valueOf("a", 5000));
        ResponseEntity<Object> response = postHoax(hoax, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
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

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsAuthorized_receiveHoaxVM() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
        assertThat(response.getBody().getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postHoax_whenHoaxIsValidAndUserIsAuthorized_receiveHeaderLocation() {
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Hoax hoax = createValidHoax();
        ResponseEntity<HoaxVM> response = postHoax(hoax, HoaxVM.class);
        assertThat(response.getHeaders().get("location")).contains("/api/v1/hoaxes/" + response.getBody().getId());
    }

    @Test
    public void getHoaxes_whenThereAreNoHoaxes_receiveOk() {
        ResponseEntity<Object> response = getHoaxes(new ParameterizedTypeReference<Object>() {
        });
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getHoaxes_whenThereAreNoHoaxes_receivePageWithZeroItems() {
        ResponseEntity<TestPage<Object>> response = getHoaxes(new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getHoaxes_whenThereAreHoaxes_receivePageWithItems() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<Object>> response = getHoaxes(new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getHoaxes_whenThereAreHoaxes_receivePageWithHoaxVM() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<HoaxVM>> response = getHoaxes(new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(1);
    }

    @Test
    public void getHoaxesOfUser_whenUserExists_receiveOK() {
        userService.save(createValidUser("user1"));
        String path = "/api/v1/users/user1/hoaxes";
        ResponseEntity<Object> response = testRestTemplate.getForEntity(path, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getHoaxesOfUser_whenUserDoesNotExist_receiveNotFound() {
        String path = "/api/v1/users/unknown-user/hoaxes";
        ResponseEntity<Object> response = testRestTemplate.getForEntity(path, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getHoaxesOfUser_whenUserExists_receivePageOfZeroHoaxes() {
        userService.save(createValidUser("user1"));
        ResponseEntity<TestPage<Object>> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getHoaxesOfUser_whenUserExistsWithHoax_receivePageWithHoaxVM() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<HoaxVM>> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        HoaxVM hoaxVM = response.getBody().getContent().get(0);
        assertThat(hoaxVM.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void getHoaxesOfUser_whenUserExistsWithMultipleHoaxes_receivePageWithMatchingHoaxesCount() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<HoaxVM>> response = getHoaxesOfUser("user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getHoaxesOfUser_whenMultipleUserExistWithMultipleHoaxes_receivePageWithMatchingHoaxesCount() {
        User userWithThreeHoaxes = userService.save(createValidUser("user1"));
        User userWithFiveHoaxes = userService.save(createValidUser("user2"));
        IntStream.rangeClosed(1, 3).forEach(i -> hoaxService.saveHoax(createValidHoax(), userWithThreeHoaxes));
        IntStream.rangeClosed(1, 5).forEach(i -> hoaxService.saveHoax(createValidHoax(), userWithFiveHoaxes));
        ResponseEntity<TestPage<HoaxVM>> response = getHoaxesOfUser(userWithFiveHoaxes.getUsername(), new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(5);
    }

    @Test
    public void getOldHoaxes_whenThereAreNoHoaxes_receiveOk() {
        ResponseEntity<Object> response = getOldHoaxes(5, new ParameterizedTypeReference<Object>() {
        });
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldHoaxes_whenThereAreHoaxes_receivePageWithItemsProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<Object>> response = getOldHoaxes(fourth.getId(), new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldHoaxes_whenThereAreHoaxes_receivePageWithHoaxVMBeforeProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxes(fourth.getId(), new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getBody().getContent().get(0).getTimestamp()).isNotNull();
    }

    @Test
    public void getOldHoaxesOfUser_whenThereAreNoHoaxes_receiveOk() {
        userService.save(createValidUser("user1"));
        ResponseEntity<Object> response = getOldHoaxesOfUser(5, "user1", new ParameterizedTypeReference<Object>() {
        });
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldHoaxesOfUser_whenUserExistsAndThereHoaxes_receivePageWithHoaxVMBeforeProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldHoaxesOfUser_whenUserExistsAndThereHoaxes_receivePageWithItemsProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getBody().getContent().get(0).getTimestamp()).isNotNull();
    }

    @Test
    public void getOldHoaxesOfUser_whenUserExistsAndThereAreNoHoaxes_receivePageWithItemsProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        userService.save(createValidUser("user2"));

        ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(fourth.getId(), "user2", new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getOldHoaxesOfUser_whenUserDoesNotExist_receiveNotFound() {
        ResponseEntity<TestPage<HoaxVM>> response = getOldHoaxesOfUser(4, "non-existing-user", new ParameterizedTypeReference<TestPage<HoaxVM>>() {
        });
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getNewHoaxes_whenThereAreNewHoaxes_receiveListOfItemsAfterProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<List<Object>> response = getNewHoaxes(fourth.getId(), new ParameterizedTypeReference<List<Object>>() {
        });
        assertThat(response.getBody().size()).isEqualTo(1);
    }

    @Test
    public void getNewHoaxes_whenThereAreNewHoaxes_receiveListOfHoaxVMAfterProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<List<HoaxVM>> response = getNewHoaxes(fourth.getId(), new ParameterizedTypeReference<List<HoaxVM>>() {
        });
        assertThat(response.getBody().get(0).getTimestamp()).isNotNull();
    }


    @Test
    public void getNewHoaxesOfUser_whenUserExistsAndThereAreNoHoaxes_receiveOk() {
        userService.save(createValidUser("user1"));
        ResponseEntity<Object> response = getNewHoaxesOfUser(5, "user1", new ParameterizedTypeReference<Object>() {
        });
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getNewHoaxesOfUser_whenUserExistsAndThereHoaxes_receiveListOfItemsAfterProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<List<Object>> response = getNewHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<List<Object>>() {
        });
        assertThat(response.getBody().size()).isEqualTo(1);
    }

    @Test
    public void getNewHoaxesOfUser_whenUserExistsAndThereHoaxes_receiveListOfHoaxVMAfterProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<List<HoaxVM>> response = getNewHoaxesOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<List<HoaxVM>>() {
        });
        assertThat(response.getBody().get(0).getTimestamp()).isNotNull();
    }

    @Test
    public void getNewHoaxesOfUser_whenUserDoesNotExist_receiveNotFound() {
        ResponseEntity<Object> response = getNewHoaxesOfUser(4, "non-existing-user", new ParameterizedTypeReference<Object>() {
        });
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getNewHoaxesOfUser_whenUserExistsAndThereAreNoHoaxes_receiveListWithZeroItemsAfterProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        userService.save(createValidUser("user2"));

        ResponseEntity<List<HoaxVM>> response = getNewHoaxesOfUser(fourth.getId(), "user2", new ParameterizedTypeReference<List<HoaxVM>>() {
        });
        assertThat(response.getBody().size()).isEqualTo(0);
    }

    @Test
    public void getNewHoaxCount_whenThereAreHoaxes_receiveCountAfterProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<Map<String, Long>> response = getNewHoaxCount(fourth.getId(), new ParameterizedTypeReference<Map<String, Long>>() {
        });
        assertThat(response.getBody().get("count")).isEqualTo(1);
    }

    @Test
    public void getNewHoaxCountOfUser_whenThereAreHoaxes_receiveCountAfterProvidedId() {
        User user1 = userService.save(createValidUser("user1"));
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);
        Hoax fourth = hoaxService.saveHoax(createValidHoax(), user1);
        hoaxService.saveHoax(createValidHoax(), user1);

        ResponseEntity<Map<String, Long>> response = getNewHoaxCount(fourth.getId(), "user1", new ParameterizedTypeReference<Map<String, Long>>() {
        });
        assertThat(response.getBody().get("count")).isEqualTo(1);
    }

    private <T> ResponseEntity<T> getNewHoaxCount(long id, ParameterizedTypeReference<T> responseType) {
        String path = API_V1_HOAXES + "/" + id + "?direction=after&count=true";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> getNewHoaxCount(long id, String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/v1/users/" + username + "/hoaxes/" + id + "?direction=after&count=true";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> postHoax(Hoax hoax, Class<T> responseType) {
        return testRestTemplate.postForEntity(API_V1_HOAXES, hoax, responseType);
    }

    private <T> ResponseEntity<T> getHoaxes(ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(API_V1_HOAXES, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> getNewHoaxes(long id, ParameterizedTypeReference<T> responseType) {
        String path = API_V1_HOAXES + "/" + id + "?direction=after&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> getOldHoaxes(long id, ParameterizedTypeReference<T> responseType) {
        String path = API_V1_HOAXES + "/" + id + "?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> getOldHoaxesOfUser(long id, String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/v1/users/" + username + "/hoaxes/" + id + "?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> getNewHoaxesOfUser(long id, String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/v1/users/" + username + "/hoaxes/" + id + "?direction=after&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> getHoaxesOfUser(String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/v1/users/" + username + "/hoaxes";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }
}
