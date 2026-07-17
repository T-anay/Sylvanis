# Sylvanis: Global Wildfire Intelligence & Detection System 🔥🛰️

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot)
![Python](https://img.shields.io/badge/AI%20Service-Python%20%2B%20Flask-3776AB?style=for-the-badge&logo=python)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)

## 📌 Project Overview
**Sylvanis** is a full-stack, AI-powered environmental monitoring platform designed to detect and track forest fires in real-time. By integrating **NASA's FIRMS Satellite API** with an intelligent **Machine Learning prediction engine**, Sylvanis provides a comprehensive, responsive, and global dashboard for early fire detection and management.

This project was built from the ground up to showcase a scalable, microservices-oriented architecture suitable for enterprise-level applications.

## 🚀 Key Features
- **Real-Time Satellite Data**: Hourly synchronization with NASA FIRMS API to pinpoint active thermal anomalies worldwide.
- **AI-Powered Risk Analysis**: A machine learning model that analyzes local weather parameters (Wind, Humidity, Temperature, Rain) to calculate the Canadian FWI (Fire Weather Index) and predict fire probability.
- **Computer Vision Verification**: Uploaded images from users are processed by an AI vision service to confirm the presence of fire or smoke.
- **Interactive Global Map**: A responsive, Leaflet-based dynamic map that renders thermal points, weather stations, and user-reported incidents with custom UI layers.
- **Secure Admin Dashboard**: JWT / Basic Auth secured backend that allows administrators to verify, reject, and manage global fire reports.
- **Fully Responsive & Internationalized**: Mobile-first design architecture using modern CSS, equipped with multi-language (i18n) support.

## 🏗️ Architecture & Folder Structure
The project follows a clean, modular architecture, splitting responsibilities into dedicated tiers:

```text
📦 Sylvanis-Fire-System
 ┣ 📂 backend/         # Java Spring Boot REST API
 ┃ ┣ 📂 src/main/...   # Controllers, Models, Repositories, Security configs
 ┃ ┗ 📜 Dockerfile     # Containerization script for cloud deployment
 ┣ 📂 frontend/        # React + TypeScript + Vite SPA
 ┃ ┣ 📂 src/           # Components, Contexts, Pages, i18n locales
 ┃ ┗ 📜 package.json   # NPM dependencies
 ┗ 📂 ai-service/      # Python Machine Learning Microservice
   ┣ 📜 app.py         # Flask API for Vision and Weather risk inference
   ┗ 📜 model.pkl      # Pre-trained ML weights
```

## 💻 Tech Stack
* **Frontend**: React 18, TypeScript, Vite, Leaflet, GSAP (Animations), Recharts.
* **Backend**: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Bucket4j (Rate Limiting).
* **Database**: PostgreSQL (Neon.tech).
* **AI / ML**: Python, Flask, Scikit-learn, OpenCV.
* **DevOps**: Docker, Vercel (Frontend Hosting), Render (Backend Hosting).

## 🛡️ Security Implementations
- **Rate Limiting**: Integrated Bucket4j to limit API requests per IP and prevent DDoS attacks on reporting endpoints.
- **Authentication**: Spring Security securing administrative API routes.
- **Data Integrity**: Sanitized inputs via Hibernate/JPA to prevent SQL injections, and React's innate XSS protection.

---
*Built as a professional showcase of full-stack engineering, cloud deployment, and AI integration.*
