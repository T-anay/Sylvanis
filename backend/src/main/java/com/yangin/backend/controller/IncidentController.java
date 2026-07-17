package com.yangin.backend.controller;

import com.yangin.backend.model.FireIncident;
import com.yangin.backend.repository.FireIncidentRepository;
import com.yangin.backend.service.AiServiceClient;
import com.yangin.backend.dto.VisionPredictionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*") // Allow React Frontend
@RequiredArgsConstructor
public class IncidentController {

    private final FireIncidentRepository repository;
    private final AiServiceClient aiServiceClient;

    @GetMapping
    public List<FireIncident> getAllIncidents() {
        return repository.findAll();
    }

    @GetMapping("/analyze-camera")
    public ResponseEntity<VisionPredictionResponse> analyzeCamera(@RequestParam("url") String url) {
        VisionPredictionResponse response = aiServiceClient.predictVisionFromUrl(url);
        if (response == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(response);
    }


    @PostMapping
    public ResponseEntity<FireIncident> reportIncident(
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam("intensity") String intensity,
            @RequestParam(value = "additionalContext", required = false) String context,
            @RequestParam(value = "reporterName", required = false) String reporter,
            @RequestParam(value = "contactNumber", required = false) String contact,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        Double windSpeed = 15.0;
        Double windDirection = 180.0;
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format(java.util.Locale.US, "https://api.open-meteo.com/v1/forecast?latitude=%.6f&longitude=%.6f&current=wind_speed_10m,wind_direction_10m", latitude, longitude)))
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                String body = response.body();
                java.util.regex.Pattern speedPattern = java.util.regex.Pattern.compile("\"wind_speed_10m\"\\s*:\\s*([0-9.]+)");
                java.util.regex.Matcher speedMatcher = speedPattern.matcher(body);
                if (speedMatcher.find()) {
                    windSpeed = Double.parseDouble(speedMatcher.group(1));
                }
                
                java.util.regex.Pattern dirPattern = java.util.regex.Pattern.compile("\"wind_direction_10m\"\\s*:\\s*([0-9.]+)");
                java.util.regex.Matcher dirMatcher = dirPattern.matcher(body);
                if (dirMatcher.find()) {
                    windDirection = Double.parseDouble(dirMatcher.group(1));
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch wind data: " + e.getMessage());
        }

        FireIncident incident = FireIncident.builder()
                .latitude(latitude)
                .longitude(longitude)
                .intensity(intensity)
                .additionalContext(context)
                .reporterName(reporter)
                .contactNumber(contact)
                .windSpeed(windSpeed)
                .windDirection(windDirection)
                .build();

        // If an image is provided, ask AI for verification and save it locally
        if (file != null && !file.isEmpty()) {
            try {
                String projectDir = System.getProperty("user.dir");
                java.io.File uploadDir = new java.io.File(projectDir, "uploads");
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String originalName = file.getOriginalFilename();
                String ext = "";
                if (originalName != null && originalName.contains(".")) {
                    ext = originalName.substring(originalName.lastIndexOf("."));
                }
                String uniqueName = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID().toString().substring(0, 8) + ext;
                java.io.File dest = new java.io.File(uploadDir, uniqueName);
                file.transferTo(dest);
                incident.setImagePath("http://localhost:8080/uploads/" + uniqueName);
            } catch (Exception e) {
                System.err.println("Failed to save uploaded file: " + e.getMessage());
            }

            VisionPredictionResponse aiResult = aiServiceClient.predictVision(file);
            if (aiResult != null && !aiResult.getDetections().isEmpty()) {
                incident.setAiConfirmedFire(aiResult.getFire_detected());
                
                // Get the highest confidence detection
                VisionPredictionResponse.Detection bestMatch = aiResult.getDetections().stream()
                        .max((d1, d2) -> d1.getConfidence().compareTo(d2.getConfidence()))
                        .orElse(null);
                        
                if (bestMatch != null) {
                    incident.setAiConfidenceScore(bestMatch.getConfidence());
                    incident.setAiDetectionLabel(bestMatch.getLabel());
                }
            } else {
                incident.setAiConfirmedFire(false);
            }
        }

        FireIncident saved = repository.save(incident);
        return ResponseEntity.ok(saved);
    }

    private void deletePhysicalFile(String imagePath) {
        if (imagePath != null && imagePath.contains("/uploads/")) {
            String fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
            String projectDir = System.getProperty("user.dir");
            java.io.File file = new java.io.File(projectDir + "/uploads/" + fileName);
            if (file.exists()) {
                file.delete();
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncident(@PathVariable Long id) {
        return repository.findById(id).map(incident -> {
            deletePhysicalFile(incident.getImagePath());
            repository.delete(incident);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<FireIncident> verifyIncident(@PathVariable Long id, @RequestParam Boolean isFire) {
        return repository.findById(id).map(incident -> {
            incident.setAiConfirmedFire(isFire);
            deletePhysicalFile(incident.getImagePath());
            incident.setImagePath(null); // Clear image path since image is deleted
            return ResponseEntity.ok(repository.save(incident));
        }).orElse(ResponseEntity.notFound().build());
    }
}
