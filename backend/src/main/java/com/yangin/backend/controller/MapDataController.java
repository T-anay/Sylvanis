package com.yangin.backend.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.yangin.backend.service.NasaFirmsService;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/map-data")
@CrossOrigin(origins = "*")
public class MapDataController {

    @Autowired
    private NasaFirmsService nasaFirmsService;

    @Data
    @AllArgsConstructor
    public static class OfficialFire {
        private String id;
        private Double latitude;
        private Double longitude;
        private String source; // e.g., "NASA_FIRMS", "ESRI"
        private String severity;
        private Double windSpeed;
        private Double windDirection;
    }

    @Data
    @AllArgsConstructor
    public static class AiPrediction {
        private String id;
        private Double latitude;
        private Double longitude;
        private Double riskPercentage; // e.g., 92.5
        private String reason; // e.g., "High temp, low humidity"
    }

    @GetMapping("/official-fires")
    public List<OfficialFire> getOfficialFires() {
        return nasaFirmsService.getActiveFires();
    }

    @GetMapping("/ai-predictions")
    public List<AiPrediction> getAiPredictions() {
        return Arrays.asList(
            new AiPrediction("AI-1", 37.8, 29.1, 94.5, "Extreme drought, temp > 40C"), // Denizli
            new AiPrediction("AI-2", 36.6, 29.5, 88.0, "High wind speed, dry vegetation"), // Fethiye area
            new AiPrediction("AI-3", 39.9, 32.8, 75.0, "Rising temperatures, low humidity") // Ankara
        );
    }
}
