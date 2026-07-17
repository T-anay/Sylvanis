package com.yangin.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fire_incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FireIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double latitude;
    private Double longitude;
    
    private String intensity; // Small, Medium, Large
    
    @Column(columnDefinition = "TEXT")
    private String additionalContext;
    
    private String reporterName;
    private String contactNumber;

    // AI Analysis results
    private Boolean aiConfirmedFire;
    private Double aiConfidenceScore;
    private String aiDetectionLabel; // e.g., "fire", "smoke"
    
    private String imagePath; // Path to uploaded evidence photo

    private Double windSpeed;
    private Double windDirection;

    private LocalDateTime reportedAt;

    @PrePersist
    protected void onCreate() {
        this.reportedAt = LocalDateTime.now();
    }
}
