package com.jerseyhub.common.controller;

import com.jerseyhub.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "System operational health status API")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(ObjectProvider<DataSource> dataSourceProvider) {
        this.dataSource = dataSourceProvider.getIfAvailable();
    }

    @GetMapping
    @Operation(summary = "Check application health status", description = "Returns system operational status and service database availability")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        String dbStatus = "NOT_CONFIGURED";
        if (dataSource != null) {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(2)) {
                    dbStatus = "UP";
                } else {
                    dbStatus = "DOWN";
                }
            } catch (Exception e) {
                dbStatus = "DOWN";
            }
        }

        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "APPLICATION_UP");
        healthInfo.put("application", "JerseyHub Backend");
        healthInfo.put("version", "1.0.0");
        healthInfo.put("database", dbStatus);
        healthInfo.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(ApiResponse.success("JerseyHub backend operational", healthInfo));
    }
}
