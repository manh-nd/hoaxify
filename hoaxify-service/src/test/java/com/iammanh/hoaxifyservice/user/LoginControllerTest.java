package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.error.ApiError;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
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

import java.util.Map;

import static com.iammanh.hoaxifyservice.utils.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoginControllerTest {

    private final String API_V1_LOGIN = "/api/v1/login";

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception {
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    @Test
    public void postLogin_withoutCredentials_receiveUnauthorized() {
        ResponseEntity<Object> response = login(Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withoutIncorrectCredentials_receiveUnauthorized() {
        authenticate();
        ResponseEntity<Object> response = login(Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiError() {
        ResponseEntity<ApiError> response = login(ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_V1_LOGIN);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiErrorWithoutWWWAuthenticationHeader() {
        ResponseEntity<Object> response = login(Object.class);
        assertThat(response.getHeaders().get("WWW-Authentication")).isNull();
    }

    @Test
    public void postLogin_withValidCredentials_receiveOk() {
        userService.save(createValidUser());
        authenticate();
        ResponseEntity<ApiError> response = login(ApiError.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUsersId() {
        User inDB = userService.save(createValidUser());
        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {});
        Integer id = (Integer) response.getBody().get("id");
        assertThat(id).isEqualTo(inDB.getId());
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUsersImage() {
        User inDB = userService.save(createValidUser());
        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {
        });
        assertThat(response.getBody().get("image")).isEqualTo(inDB.getImage());
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUsersDisplayName() {
        User inDB = userService.save(createValidUser());
        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {
        });
        assertThat(response.getBody().get("displayName")).isEqualTo(inDB.getDisplayName());
    }

    @Test
    public void postLogin_withValidCredentials_receiveLoggedInUsersUsername() {
        User inDB = userService.save(createValidUser());
        authenticate();
        ResponseEntity<Map<String, Object>> response = login(new ParameterizedTypeReference<Map<String, Object>>() {});
        assertThat(response.getBody().get("username")).isEqualTo(inDB.getUsername());
    }

    @Test
    public void postLogin_withValidCredentials_notReceiveLoggedInUsersPassword() {
        userService.save(createValidUser());
        authenticate();
        ResponseEntity<String> response = login(String.class);
        assertThat(response.getBody().contains("password")).isFalse();
    }

    private void authenticate() {
        testRestTemplate.getRestTemplate().getInterceptors()
                .add(new BasicAuthenticationInterceptor("test-user", "P4ssword"));
    }

    private <T> ResponseEntity<T> login(Class<T> responseType) {
        return testRestTemplate.postForEntity(API_V1_LOGIN, null, responseType);
    }

    private <T> ResponseEntity<T> login(ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(API_V1_LOGIN, HttpMethod.POST, null, responseType);
    }
}
