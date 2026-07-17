package com.yangin.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class VisionPredictionResponse {
    private List<Detection> detections;
    private Boolean fire_detected;

    @Data
    public static class Detection {
        private String label;
        private Double confidence;
        private Box box;
    }

    @Data
    public static class Box {
        private Double x1;
        private Double y1;
        private Double x2;
        private Double y2;
    }
}
