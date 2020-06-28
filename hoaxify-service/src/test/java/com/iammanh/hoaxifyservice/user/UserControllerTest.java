package com.iammanh.hoaxifyservice.user;

import com.iammanh.hoaxifyservice.configuration.AppConfiguration;
import com.iammanh.hoaxifyservice.error.ApiError;
import com.iammanh.hoaxifyservice.model.TestPage;
import com.iammanh.hoaxifyservice.shared.GenericApiResponse;
import com.iammanh.hoaxifyservice.user.vm.UserUpdateVM;
import com.iammanh.hoaxifyservice.user.vm.UserVM;
import org.apache.commons.io.FileUtils;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.iammanh.hoaxifyservice.utils.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class UserControllerTest {

    private final String API_V1_USERS = "/api/v1/users";

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private AppConfiguration appConfiguration;

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception {
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
        FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate().getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }

    // ####################### POST USER ##########################

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

    // ####################### GET USERS ##########################

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

    // ####################### GET USER ##########################
    @Test
    public void getUserByUsername_whenUserExist_receiveOk() {
        String username = "test-user";
        userService.save(createValidUser(username));
        ResponseEntity<Object> response = getUser(username, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getUserByUsername_whenUserExist_receiveUserWithoutPassword() {
        String username = "test-user";
        userService.save(createValidUser(username));
        ResponseEntity<String> response = getUser(username, String.class);
        assertThat(response.getBody().contains("password")).isFalse();
    }

    @Test
    public void getUserByUsername_whenUserDoesNotExist_receiveNotFound() {
        String username = "unknown-user";
        ResponseEntity<Object> response = getUser(username, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getUserByUsername_whenUserDoesNotExist_receiveApiError() {
        String username = "unknown-user";
        ResponseEntity<String> response = getUser(username, String.class);
        assertThat(response.getBody().contains("unknown-user")).isTrue();
    }

    private <T> ResponseEntity<T> getUser(String username, Class<T> responseType) {
        return testRestTemplate.getForEntity(API_V1_USERS + "/" + username, responseType);
    }

    // ####################### PUT USER ##########################

    @Test
    public void putUser_whenUnauthorizedUserSendsTheRequest_receiveUnauthorized() {
        ResponseEntity<Object> response = putUser(123, null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void putUser_whenAuthorizedUserSendsUpdateForAnotherUser_receiveForbidden() {
        User user = userService.save(createValidUser("user1"));

        authenticate(user.getUsername());
        ResponseEntity<Object> response = putUser(user.getId() + 123, null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    public void putUser_whenUnauthorizedUserSendsTheRequest_receiveApiError() {
        ResponseEntity<ApiError> response = putUser(123, null, ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_V1_USERS + "/123");
    }

    @Test
    public void putUser_whenAuthorizedUserSendsUpdateForAnotherUser_receiveApiError() {
        User user = userService.save(createValidUser("user1"));

        authenticate(user.getUsername());
        long anotherUserId = user.getId() + 123;
        ResponseEntity<ApiError> response = putUser(anotherUserId, null, ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_V1_USERS + "/" + anotherUserId);
    }

    @Test
    public void putUser_whenValidRequestBodyFromAuthorizedUser_receiveOk() {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());
        UserUpdateVM userUpdateVM = createValidUserUpdateVM();

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void putUser_whenValidRequestBodyFromAuthorizedUser_receiveUserVMWithUpdatedDisplayName() {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());
        UserUpdateVM userUpdateVM = createValidUserUpdateVM();

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);

        assertThat(response.getBody().getDisplayName()).isEqualTo("new-display-name");
    }

    @Test
    public void putUser_whenValidRequestBodyWithSupportedImageFromAuthorizedUser_receiveUserVMWithRandomImageName() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        ClassPathResource imageSource = new ClassPathResource("profile.png");

        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        byte[] imageBytes = FileUtils.readFileToByteArray(imageSource.getFile());
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        userUpdateVM.setImage(base64Image);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);

        assertThat(response.getBody().getImage()).isNotEqualTo("profile.png");
    }

    @Test
    public void putUser_whenValidRequestBodyWithSupportedImageFromAuthorizedUser_imageIsStoreUnderProfileFolder() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        ClassPathResource imageSource = new ClassPathResource("profile.png");

        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        byte[] imageBytes = FileUtils.readFileToByteArray(imageSource.getFile());
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        userUpdateVM.setImage(base64Image);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);

        String storedImageName = response.getBody().getImage();
        String profileImagePath = appConfiguration.getFullProfileImagesPath() + "/" + storedImageName;
        File file = new File(profileImagePath);
        assertThat(file.exists()).isTrue();
    }


    @Test
    public void putUser_withInvalidRequestBodyWithNullDisplayNameFromAuthorizedUser_receiveBadRequest() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        userUpdateVM.setDisplayName(null);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_withInvalidRequestBodyWithLessThanMinimumSizeForDisplayNameFromAuthorizedUser_receiveBadRequest() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        userUpdateVM.setDisplayName("abc");

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_withInvalidRequestBodyWithMoreThanMaximumSizeForDisplayNameFromAuthorizedUser_receiveBadRequest() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        String displayNameOf46Chars = IntStream.rangeClosed(1, 46).mapToObj(v -> "a").collect(Collectors.joining());
        userUpdateVM.setDisplayName(displayNameOf46Chars);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_withValidRequestBodyWithJPGImageFromAuthorizedUser_receiveOk() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        ClassPathResource imageSource = new ClassPathResource("profile.jpg");
        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        byte[] imageBytes = FileUtils.readFileToByteArray(imageSource.getFile());
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        userUpdateVM.setImage(base64Image);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void putUser_withValidRequestBodyWithGIFImageFromAuthorizedUser_receiveOk() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        ClassPathResource imageSource = new ClassPathResource("profile.gif");
        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        byte[] imageBytes = FileUtils.readFileToByteArray(imageSource.getFile());
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        userUpdateVM.setImage(base64Image);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_withValidRequestBodyWithTXTFileFromAuthorizedUser_receiveValidationErrorForProfileImage() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        ClassPathResource imageSource = new ClassPathResource("profile.txt");
        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        byte[] imageBytes = FileUtils.readFileToByteArray(imageSource.getFile());
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        userUpdateVM.setImage(base64Image);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<ApiError> response = putUser(user.getId(), requestEntity, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("image")).isEqualTo("Only PNG and JPG files are allowed");
    }

    @Test
    public void putUser_withValidRequestBodyWithJPGFileFromAuthorizedUser_removesOldImageFromStorage() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        ClassPathResource imageSource = new ClassPathResource("profile.png");
        UserUpdateVM userUpdateVM = createValidUserUpdateVM();
        byte[] imageBytes = FileUtils.readFileToByteArray(imageSource.getFile());
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        userUpdateVM.setImage(base64Image);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(userUpdateVM);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);

        putUser(user.getId(), requestEntity, ApiError.class);

        String storedImageName = response.getBody().getImage();
        String profileImagePath = appConfiguration.getFullProfileImagesPath() + "/" + storedImageName;
        File profileImageFile = new File(profileImagePath);

        assertThat(profileImageFile.exists()).isFalse();
    }

    private UserUpdateVM createValidUserUpdateVM() {
        UserUpdateVM userUpdateVM = new UserUpdateVM();
        userUpdateVM.setDisplayName("new-display-name");
        return userUpdateVM;
    }

    private <T> ResponseEntity<T> putUser(long id, HttpEntity<?> requestEntity, Class<T> responseType) {
        String path = API_V1_USERS + "/" + id;
        return testRestTemplate.exchange(path, HttpMethod.PUT, requestEntity, responseType);
    }
}
