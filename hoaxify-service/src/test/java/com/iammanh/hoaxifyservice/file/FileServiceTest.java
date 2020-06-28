package com.iammanh.hoaxifyservice.file;

import com.iammanh.hoaxifyservice.configuration.AppConfiguration;
import org.apache.commons.io.FileUtils;
import org.apache.tika.mime.MimeTypeException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringRunner.class)
@ActiveProfiles("test")
public class FileServiceTest {

    FileService fileService;

    AppConfiguration appConfiguration;

    File profileImagesPath;
    File attachmentsPath;

    @Before
    public void setUp() {
        appConfiguration = new AppConfiguration();
        appConfiguration.setUploadPath("uploads-test");

        fileService = new FileService(appConfiguration);

        profileImagesPath = new File(appConfiguration.getFullProfileImagesPath());
        attachmentsPath = new File(appConfiguration.getFullAttachmentsPath());

        profileImagesPath.mkdir();
        attachmentsPath.mkdir();
    }

    @After
    public void cleanUp() throws Exception {
        if (profileImagesPath.exists())
            FileUtils.cleanDirectory(profileImagesPath);
        if(attachmentsPath.exists())
            FileUtils.cleanDirectory(attachmentsPath);
    }

    @Test
    public void detectType_whenPngFileProvided_returnsImagePng() throws IOException {
        ClassPathResource resource = new ClassPathResource("profile.png");
        byte[] fileArray = FileUtils.readFileToByteArray(resource.getFile());
        String fileType = fileService.detectType(fileArray);
        assertThat(fileType).isEqualToIgnoringCase("image/png");
    }

    @Test
    public void getExtension_whenPngFileProvided_returnsPng() throws IOException, MimeTypeException {
        ClassPathResource resource = new ClassPathResource("profile.png");
        byte[] fileArray = FileUtils.readFileToByteArray(resource.getFile());
        String extension = fileService.getExtension(fileArray);
        assertThat(extension).isEqualToIgnoringCase(".png");
    }

    @Test
    public void getExtension_whenTextFileProvided_returnsTxt() throws IOException, MimeTypeException {
        ClassPathResource resource = new ClassPathResource("profile.txt");
        byte[] fileArray = FileUtils.readFileToByteArray(resource.getFile());
        String extension = fileService.getExtension(fileArray);
        assertThat(extension).isEqualToIgnoringCase(".txt");
    }

    @Test
    public void getExtension_whenJPGFileProvided_returnsJpeg() throws IOException, MimeTypeException {
        ClassPathResource resource = new ClassPathResource("profile.jpg");
        byte[] fileArray = FileUtils.readFileToByteArray(resource.getFile());
        String extension = fileService.getExtension(fileArray);
        assertThat(extension).isEqualToIgnoringCase(".jpg");
    }

}
