package com.jerseyhub.common;

import com.jerseyhub.common.controller.HealthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@ActiveProfiles("dev")
class DatabaseIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("jerseyhub_test")
            .withUsername("test_user")
            .withPassword("test_password");

    @Autowired
    private DataSource dataSource;

    @Autowired
    private HealthController healthController;

    @Test
    void testcontainersPostgresqlConnectionAndFlywayMigrationShouldSucceed() throws Exception {
        assertThat(postgres.isRunning()).isTrue();
        assertThat(dataSource).isNotNull();

        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection.isValid(2)).isTrue();

            // Verify Flyway executed V1__init.sql and system_metadata table exists
            try (ResultSet rs = connection.createStatement().executeQuery(
                    "SELECT system_version FROM system_metadata WHERE id = 'JERSEYHUB_BASE'"
            )) {
                assertThat(rs.next()).isTrue();
                assertThat(rs.getString("system_version")).isEqualTo("1.0.0");
            }
        }

        assertThat(healthController).isNotNull();
    }
}
