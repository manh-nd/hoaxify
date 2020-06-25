package com.iammanh.hoaxifyservice;

import com.iammanh.hoaxifyservice.configuration.AppConfiguration;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.File;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class HoaxifyServiceApplicationTests {

	@Autowired
	AppConfiguration appConfiguration;

	@Autowired
	MockMvc mockMvc;

	@After
	public void tearDown() throws Exception {
		FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
		FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
	}

	@Test
	public void checkStaticFolder_whenApiIsInitialized_uploadFolderMustExist() {
		File file = new File(appConfiguration.getUploadPath());
		boolean uploadFolderExist = file.exists() && file.isDirectory();
		assertThat(uploadFolderExist).isTrue();
	}

	@Test
	public void checkStaticFolder_whenApiIsInitialized_profileImageSubFolderMustExist() {
		String profileImageFolderPath = appConfiguration.getFullProfileImagesPath();
		File profileImageFolder = new File(profileImageFolderPath);
		boolean profileUploadFolderExist = profileImageFolder.exists() && profileImageFolder.isDirectory();
		assertThat(profileUploadFolderExist).isTrue();
	}

	@Test
	public void checkStaticFolder_whenApiIsInitialized_attachmentsSubFolderMustExist() {
		String attachmentsFolderPath = appConfiguration.getFullAttachmentsPath();
		File attachmentsFolder = new File(attachmentsFolderPath);
		boolean attachmentsFolderExist = attachmentsFolder.exists() && attachmentsFolder.isDirectory();
		assertThat(attachmentsFolderExist).isTrue();
	}

	@Test
	public void getStaticFile_whenImageExistInProfileUploadFolder_receiveOk() throws Exception {
		String fileName = "profile.png";
		File source = new ClassPathResource("profile.png").getFile();

		File target = new File(appConfiguration.getFullProfileImagesPath() + "/" + fileName);
		FileUtils.copyFile(source, target);

		mockMvc.perform(get("/images/" + appConfiguration.getProfileImagesFolder() + "/" + fileName))
				.andExpect(status().isOk());
	}

	@Test
	public void getStaticFile_whenImageExistInAttachmentsUploadFolder_receiveOk() throws Exception {
		String fileName = "profile.png";
		File source = new ClassPathResource("profile.png").getFile();

		File target = new File(appConfiguration.getFullAttachmentsPath() + "/" + fileName);
		FileUtils.copyFile(source, target);

		mockMvc.perform(get("/images/" + appConfiguration.getAttachmentsFolder() + "/" + fileName))
				.andExpect(status().isOk());
	}

	@Test
	public void getStaticFile_whenImageDoesNotExist_receiveNotFound() throws Exception {
		mockMvc.perform(get("/images/" + appConfiguration.getAttachmentsFolder() + "/there-is-no-such-image.png"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void getStaticFile_whenImageExistInAttachmentsUploadFolder_receiveOkWithCacheHeader() throws Exception {
		String fileName = "profile.png";
		File source = new ClassPathResource("profile.png").getFile();

		File target = new File(appConfiguration.getFullAttachmentsPath() + "/" + fileName);
		FileUtils.copyFile(source, target);

		MvcResult mvcResult = mockMvc
				.perform(get("/images/" + appConfiguration.getAttachmentsFolder() + "/" + fileName))
				.andReturn();

		String cacheControl = mvcResult.getResponse().getHeaderValue("Cache-Control").toString();
		assertThat(cacheControl).containsIgnoringCase("max-age=31536000");
	}
}
