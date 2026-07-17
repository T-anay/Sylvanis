package com.yangin.backend.service;

import com.yangin.backend.controller.MapDataController.OfficialFire;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class NasaFirmsService {

    // NASA FIRMS public 24h CSV URL for VIIRS (NOAA-20)
    private static final String NASA_CSV_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv";
    
    // Cache the list in memory
    private List<OfficialFire> cachedFires = new ArrayList<>();
    
    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        // Fetch data when the server starts
        fetchFireData();
    }

    // Schedule to run every 1 hour (3600000 ms) automatically
    @Scheduled(fixedRate = 3600000)
    public void fetchFireData() {
        try {
            System.out.println("Fetching latest live fire data from NASA FIRMS...");
            String csvData = restTemplate.getForObject(NASA_CSV_URL, String.class);
            
            if (csvData == null || csvData.isEmpty()) {
                System.out.println("NASA data is empty!");
                return;
            }

            List<OfficialFire> newFires = new ArrayList<>();
            BufferedReader reader = new BufferedReader(new StringReader(csvData));
            String line = reader.readLine(); // Skip header
            
            int idCounter = 1;

            while ((line = reader.readLine()) != null) {
                String[] columns = line.split(",");
                if (columns.length < 9) continue;

                try {
                    double lat = Double.parseDouble(columns[0]);
                    double lon = Double.parseDouble(columns[1]);
                    String confidence = columns[8]; // e.g., "nominal", "low", "high"
                    
                    // Filter: Only keep fires within/around Turkey (Lat: 35 to 43, Lon: 25 to 45)
                    if (lat >= 35.0 && lat <= 43.0 && lon >= 25.0 && lon <= 45.0) {
                        
                        // Ignore low confidence to avoid false positives
                        if (!"low".equalsIgnoreCase(confidence)) {
                            // Mocking wind speed and direction since NASA only gives thermal anomalies
                            double mockWindSpeed = 15.0 + (Math.random() * 20); // 15 to 35 km/h
                            double mockWindDir = Math.random() * 360; 
                            
                            OfficialFire fire = new OfficialFire(
                                "NASA-" + idCounter++,
                                lat,
                                lon,
                                "NASA_FIRMS",
                                "high".equalsIgnoreCase(confidence) ? "CRITICAL" : "HIGH",
                                mockWindSpeed,
                                mockWindDir
                            );
                            newFires.add(fire);
                        }
                    }
                } catch (Exception e) {
                    // Ignore parse errors on specific rows
                }
            }
            
            this.cachedFires = newFires;
            System.out.println("Successfully updated NASA fire data. Active fires in Turkey region: " + newFires.size());
            
        } catch (Exception e) {
            System.err.println("Failed to fetch NASA data: " + e.getMessage());
        }
    }

    public List<OfficialFire> getActiveFires() {
        return cachedFires;
    }
}
