package com.iammanh.hoaxifyservice.shared;

import com.iammanh.hoaxifyservice.file.FileService;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Base64;

public class ProfileImageValidator implements ConstraintValidator<ProfileImage, String> {

    private final FileService fileService;

    public ProfileImageValidator(FileService fileService) {
        this.fileService = fileService;
    }


    public boolean isValid(String base64Image, ConstraintValidatorContext context) {
        if(base64Image == null)
            return true;
        try {
            byte[] decodedImageFile = Base64.getDecoder().decode(base64Image);
            String fileType = fileService.detectType(decodedImageFile);
            return fileType.equalsIgnoreCase("image/png")
                    || fileType.equalsIgnoreCase("image/jpeg");
        } catch (Exception e) {
            return false;
        }
    }

}
