package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.error.ApiError;
import com.iammanh.hoaxifyservice.model.TestPage;
import com.iammanh.hoaxifyservice.shared.GenericApiResponse;
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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.iammanh.hoaxifyservice.utils.TestUtil.createValidUser;
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
    public void postUser_whenUserIsValid_receiveCreated() {
        User user = createValidUser();
        ResponseEntity<Object> response = postSignup(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    public void postUser_whenUserIsValid_userSavedToDatabase() {
        User user = createValidUser();
        postSignup(user, Object.class);
        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    public void postUser_whenUserIsValid_receiveSuccessMessage() {
        User user = createValidUser();
        ResponseEntity<GenericApiResponse> response = postSignup(user, GenericApiResponse.class);
        assertThat(response.getBody().getMessage()).isNotNull();
    }

    @Test
    public void postUser_whenUserIsValid_passwordIsHashedInDatabase() {
        User user = createValidUser();
        postSignup(user, Object.class);
        User userInDB = userRepository.findAll().get(0);
        assertThat(userInDB.getPassword()).isNotEqualTo(user.getPassword());
    }

    @Test
    public void postUser_whenUserIsValid_receiveLocationHeader() {
        User user = createValidUser();
        ResponseEntity<Object> response = postSignup(user, Object.class);

        List<String> locationUri = response.getHeaders().get("location");
        assertThat(locationUri).isNotEmpty();
    }

    @Test
    public void postUser_whenUserHasNullUsername_receiveBadRequest() {
        User user = createValidUser();
        user.setUsername(null);
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasNullPassword_receiveBadRequest() {
        User user = createValidUser();
        user.setPassword(null);
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasNullDisplayName_receiveBadRequest() {
        User user = createValidUser();
        user.setDisplayName(null);
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasUsernameWithLessThanRequired_receiveBadRequest() {
        User user = createValidUser();
        user.setUsername("abc");
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasDisplayNameWithLessThanRequired_receiveBadRequest() {
        User user = createValidUser();
        user.setDisplayName("abc");
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithLessThanRequired_receiveBadRequest() {
        User user = createValidUser();
        user.setPassword("P4sswrd");
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasUsernameExceedsTheLengthLimit_receiveBadRequest() {
        User user = createValidUser();
        String valueOf256Chars = IntStream.rangeClosed(1, 256).mapToObj(a -> "a").collect(Collectors.joining());
        user.setUsername(valueOf256Chars);
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasDisplayNameExceedsTheLengthLimit_receiveBadRequest() {
        User user = createValidUser();
        String valueOf256Chars = IntStream.rangeClosed(1, 256).mapToObj(a -> "a").collect(Collectors.joining());
        user.setDisplayName(valueOf256Chars);
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordExceedsTheLengthLimit_receiveBadRequest() {
        User user = createValidUser();
        String valueOf256Chars = IntStream.rangeClosed(1, 256).mapToObj(a -> "a").collect(Collectors.joining());
        user.setPassword("P4ssword" + valueOf256Chars);
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithAllLowercase_receiveBadRequest() {
        User user = createValidUser();
        user.setPassword("alllowercase");
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithAllUppercase_receiveBadRequest() {
        User user = createValidUser();
        user.setPassword("ALLUPPERCASE");
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithAllNumber_receiveBadRequest() {
        User user = createValidUser();
        user.setPassword("12345678");
        ResponseEntity<Object> response = postSignup(user, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserIsValid_receiveApiError() {
        User user = new User();
        ResponseEntity<ApiError> response = postSignup(user, ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_V1_USERS);
    }

    @Test
    public void postUser_whenUserIsValid_receiveApiErrorWithValidationErrors() {
        User user = new User();
        ResponseEntity<ApiError> response = postSignup(user, ApiError.class);
        assertThat(response.getBody().getValidationErrors().size()).isEqualTo(3);
    }

    @Test
    public void postUser_whenUserHasNullUsername_receiveMessageOfNullErrorForUsername() {
        User user = createValidUser();
        user.setUsername(null);
        ResponseEntity<ApiError> response = postSignup(user, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("username")).isEqualTo("Username cannot be null");
    }

    @Test
    public void postUser_whenUserHasNullPassword_receiveGenericMessageOfNullError() {
        User user = createValidUser();
        user.setPassword(null);
        ResponseEntity<ApiError> response = postSignup(user, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("password")).isEqualTo("Cannot be null");
    }

    @Test
    public void postUser_whenUserHasInvalidLengthUsername_receiveGenericMessageOfNullError() {
        User user = createValidUser();
        user.setUsername("abc");
        ResponseEntity<ApiError> response = postSignup(user, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("username")).isEqualTo("It must have minimum 4 and maximum 255 characters");
    }

    @Test
    public void postUser_whenUserHasInvalidPasswordPattern_receiveMessageOfPasswordError() {
        User user = createValidUser();
        user.setPassword("Password");
        ResponseEntity<ApiError> response = postSignup(user, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("password")).isEqualTo("Password must have at least 1 uppercase, 1 lowercase letter and 1 number");
    }

    @Test
    public void postUser_whenAnotherUserHasSameUsername_receiveBadRequest() {
        User user = createValidUser();
        userService.save(user);
        ResponseEntity<Object> response = postSignup(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenAnotherUserHasSameUsername_receiveMessageOfDupplicateUsername() {
        User user = createValidUser();
        userService.save(user);
        ResponseEntity<ApiError> response = postSignup(user, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("username")).isEqualTo("This username is in use");
    }

    @Test
    public void getUsers_whenThereAreNoUsersInDB_receiveOK() {
        ResponseEntity<Object> response = testRestTemplate.getForEntity(API_V1_USERS, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private <T> ResponseEntity<T> postSignup(User user, Class<T> clazz) {
        return testRestTemplate.postForEntity(API_V1_USERS, user, clazz);
    }

    @Test
    public void getUsers_whenThereAreNoUsersInDB_receivePageWithZeroItems() {
        ResponseEntity<TestPage<Object>> response = getUsers(new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getUsers_whenThereAreAUsersInDB_receiveUserWithoutPassword() {
        userService.save(createValidUser());
        ResponseEntity<TestPage<Map<String, Object>>> response = getUsers(new ParameterizedTypeReference<TestPage<Map<String, Object>>>() {
        });
        Map<String, Object> userItem = response.getBody().getContent().get(0);
        assertThat(userItem.containsKey("password")).isFalse();
    }

    @Test
    public void getUsers_whenPageIsRequestedFor3ItemsPerPageWhereDatabaseHas20Users_receive3Users() {
        IntStream.rangeClosed(1, 20)
                .mapToObj(item -> createValidUser("test-user" + item))
                .forEach(userService::save);

        String uri = API_V1_USERS + "?page=0&size=3";
        ResponseEntity<TestPage<Object>> response = getUsers(uri, new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getSize()).isEqualTo(3);
    }

    @Test
    public void getUsers_whenPageSizeIsNotProvided_receivePageSizeAs10() {
        ResponseEntity<TestPage<Object>> response = getUsers(new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getSize()).isEqualTo(10);
    }

    @Test
    public void getUsers_whenPageSizeGreaterThan100_receivePageSizeAs100() {
        String uri = API_V1_USERS + "?page=0&size=500";
        ResponseEntity<TestPage<Object>> response = getUsers(uri, new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getSize()).isEqualTo(100);
    }

    @Test
    public void getUsers_whenPageSizeIsNegative_receivePageSizeAs10() {
        String uri = API_V1_USERS + "?page=0&size=-1";
        ResponseEntity<TestPage<Object>> response = getUsers(uri, new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getSize()).isEqualTo(10);
    }

    @Test
    public void getUsers_whenPageIsNegative_receiveFirstPage() {
        String uri = API_V1_USERS + "?page=-1";
        ResponseEntity<TestPage<Object>> response = getUsers(uri, new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getNumber()).isEqualTo(0);
    }

    @Test
    public void getUsers_whenUserIsLoggedIn_receivePageWithoutLoggedInUser() {
        userService.save(createValidUser("user1"));
        userService.save(createValidUser("user2"));
        userService.save(createValidUser("user3"));
        authenticate("user1");
        ResponseEntity<TestPage<Object>> response = getUsers(new ParameterizedTypeReference<TestPage<Object>>() {
        });
        assertThat(response.getBody().getTotalElements()).isEqualTo(2);
    }

    private <T> ResponseEntity<T> getUsers(ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(API_V1_USERS, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> getUsers(String path, ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate().getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }
}
