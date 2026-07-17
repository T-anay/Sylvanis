package com.yangin.backend.service;

import com.yangin.backend.dto.VisionPredictionResponse;
import com.yangin.backend.dto.WeatherPredictionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import java.util.Map;

@Service
public class AiServiceClient {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherPredictionResponse predictWeather(Map<String, Object> weatherData) {
        String url = aiServiceUrl + "/api/predict/weather";
        return restTemplate.postForObject(url, weatherData, WeatherPredictionResponse.class);
    }

    public VisionPredictionResponse predictVision(MultipartFile file) {
        try {
            String url = aiServiceUrl + "/api/predict/vision";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            return restTemplate.postForObject(url, requestEntity, VisionPredictionResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public VisionPredictionResponse predictVisionFromUrl(String imageUrl) {
        try {
            // 1. Download image bytes from the URL
            byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
            if (imageBytes == null || imageBytes.length == 0) {
                return null;
            }

            // 2. Prepare request to Python AI Service
            String url = aiServiceUrl + "/api/predict/vision";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return "camera_snapshot.jpg";
                }
            };
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            return restTemplate.postForObject(url, requestEntity, VisionPredictionResponse.class);
        } catch (Exception e) {
            System.err.println("Failed to analyze image from URL: " + imageUrl + ". Error: " + e.getMessage());
            return null;
        }
    }
}

