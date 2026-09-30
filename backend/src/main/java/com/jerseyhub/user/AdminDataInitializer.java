package com.jerseyhub.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataInitializer.class);
    private static final String TARGET_ADMIN_EMAIL = "04324205191008@uits.edu.bd";

    private final UserRepository userRepository;

    public AdminDataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        String normalizedEmail = TARGET_ADMIN_EMAIL.trim().toLowerCase(Locale.ROOT);
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            if (user.getRole() != UserRole.ADMIN) {
                user.setRole(UserRole.ADMIN);
                userRepository.save(user);
                logger.info("AdminDataInitializer: Updated user {} role to ADMIN", normalizedEmail);
            }
        });
    }
}
