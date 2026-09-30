package com.jerseyhub.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sslcommerz")
public class SslCommerzConfig {

    private String storeId = "test_store";
    private String storePassword = "test_pass";
    private boolean isSandbox = true;

    public String getStoreId() {
        return storeId;
    }

    public void setStoreId(String storeId) {
        this.storeId = storeId;
    }

    public String getStorePassword() {
        return storePassword;
    }

    public void setStorePassword(String storePassword) {
        this.storePassword = storePassword;
    }

    public boolean isSandbox() {
        return isSandbox;
    }

    public void setSandbox(boolean sandbox) {
        isSandbox = sandbox;
    }

    public String getBaseUrl() {
        return isSandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
    }

    public String getSessionInitUrl() {
        return getBaseUrl() + "/gwprocess/v4/api.php";
    }

    public String getValidationUrl() {
        return getBaseUrl() + "/validator/api/validationserverAPI.php";
    }
}
