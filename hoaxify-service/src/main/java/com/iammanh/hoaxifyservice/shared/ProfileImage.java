package com.iammanh.hoaxifyservice.shared;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = ProfileImageValidator.class)
public @interface ProfileImage {
    String message() default "{hoaxify.validation.constraints.image.ProfileImage.message}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
