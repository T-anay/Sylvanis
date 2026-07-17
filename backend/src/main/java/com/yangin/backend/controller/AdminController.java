package com.yangin.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        // Simple hardcoded check for demo purposes
        if ("admin".equals(username) && "sylvanis2026".equals(password)) {
            return ResponseEntity.ok(Collections.singletonMap("token", "admin_demo_token_12345"));
        } else {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid credentials"));
        }
    }
}
