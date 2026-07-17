package com.yangin.backend.dto;

import lombok.Data;

@Data
public class WeatherPredictionResponse {
    private Double risk_score; // comes as probability from sklearn
    private Integer prediction;
    private Boolean is_fire_risk;
}
