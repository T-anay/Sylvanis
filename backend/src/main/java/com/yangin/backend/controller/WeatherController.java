package com.yangin.backend.controller;

import com.yangin.backend.service.AiServiceClient;
import com.yangin.backend.dto.WeatherPredictionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class WeatherController {

    private final AiServiceClient aiServiceClient;

    @PostMapping("/risk")
    public ResponseEntity<WeatherPredictionResponse> calculateFireRisk(@RequestBody Map<String, Object> weatherData) {
        WeatherPredictionResponse response = aiServiceClient.predictWeather(weatherData);
        return ResponseEntity.ok(response);
    }
}
