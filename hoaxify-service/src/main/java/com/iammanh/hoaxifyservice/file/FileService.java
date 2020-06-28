package com.iammanh.hoaxifyservice.file;

import com.iammanh.hoaxifyservice.configuration.AppConfiguration;
import org.apache.commons.io.FileUtils;
import org.apache.tika.Tika;
import org.apache.tika.config.TikaConfig;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.mime.MediaType;
import org.apache.tika.mime.MimeType;
import org.apache.tika.mime.MimeTypeException;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileService {
    private final AppConfiguration appConfiguration;
    private final Tika tika;
    private final TikaConfig tikaConfig;

    public FileService(AppConfiguration appConfiguration) {
        this.appConfiguration = appConfiguration;
        this.tika = new Tika();
        this.tikaConfig = TikaConfig.getDefaultConfig();
    }

    public String saveProfileImage(String base64Image) throws IOException, MimeTypeException {
        String imageName = UUID.randomUUID().toString().replaceAll("-", "");

        byte[] decodedBytes = Base64.getDecoder().decode(base64Image);
        String imageFileName = imageName + getExtension(decodedBytes);
        File target = new File(appConfiguration.getFullProfileImagesPath() + "/" + imageFileName);
        FileUtils.writeByteArrayToFile(target, decodedBytes);
        return imageFileName;
    }

    public String detectType(byte[] fileArray) {
        return tika.detect(fileArray);
    }

    public String getExtension(byte[] fileArray) throws IOException, MimeTypeException {
        MediaType mediaType = tikaConfig.getMimeRepository().detect(new ByteArrayInputStream(fileArray), new Metadata());
        MimeType mimeType = tikaConfig.getMimeRepository().forName(mediaType.toString());
        return mimeType.getExtension();
    }

    public void deleteProfileImage(String image) {
        try {
            Files.deleteIfExists(Paths.get(appConfiguration.getFullProfileImagesPath() + "/" + image));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
