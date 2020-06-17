package com.iammanh.hoaxifyservice.user;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = UniqueUsernameValidator.class)
public @interface UniqueUsername {
    String message() default "{hoaxify.validation.constraints.username.UniqueUsername.message}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
