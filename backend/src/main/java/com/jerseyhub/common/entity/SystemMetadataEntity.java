package com.jerseyhub.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "system_metadata")
public class SystemMetadataEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "system_version", length = 20, nullable = false)
    private String systemVersion;

    @Column(name = "initialized_at")
    private Instant initializedAt;

    public SystemMetadataEntity() {
    }

    public SystemMetadataEntity(String id, String systemVersion) {
        this.id = id;
        this.systemVersion = systemVersion;
        this.initializedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSystemVersion() {
        return systemVersion;
    }

    public void setSystemVersion(String systemVersion) {
        this.systemVersion = systemVersion;
    }

    public Instant getInitializedAt() {
        return initializedAt;
    }

    public void setInitializedAt(Instant initializedAt) {
        this.initializedAt = initializedAt;
    }
}
