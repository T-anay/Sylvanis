# Sylvanis 🔥🛰️

> AI-Powered Wildfire Intelligence & Detection System for Turkey — Internship Project
> Türkiye için Yapay Zeka Destekli Orman Yangını Tespit ve Analiz Sistemi — Staj Projesi

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot)
![Python](https://img.shields.io/badge/AI%20Service-Python%20%2B%20Flask-3776AB?style=for-the-badge&logo=python)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)

**Live Demo / Canlı Demo:** [sylvanis.vercel.app](https://sylvanis.vercel.app)

---

## 🇬🇧 English

Sylvanis is a full-stack, AI-powered wildfire intelligence platform built for Turkey. It integrates **NASA FIRMS satellite data**, **deep learning-based fire image detection**, and a **Random Forest weather risk analysis model** to detect, predict, and map forest fires in real time.

Developed during an internship, this project showcases a microservices-oriented architecture with three independently deployable services.

### Features

- **Real-Time Satellite Data** — Hourly sync with NASA FIRMS API, filtered for the Turkey region, to detect active thermal anomalies
- **Deep Learning Fire Image Detection** — A trained deep learning model processes user-uploaded images to detect fire or smoke presence
- **Random Forest Risk Analysis** — A machine learning model trained on historical weather data (wind speed, humidity, temperature, rainfall) calculates the Canadian Fire Weather Index (FWI) and predicts fire risk probability
- **Interactive Map** — Leaflet-based dynamic map showing thermal hotspots, weather stations across major Turkish cities, and user-reported incidents
- **Secure Admin Dashboard** — JWT-authenticated admin panel to review and manage fire reports
- **User Incident Reporting** — Registered users can submit fire reports with photos from the field

### Architecture

```
Sylvanis/
├── frontend/       # React + Vite — User dashboard & interactive map
├── backend/        # Spring Boot 3 — Core REST API, auth, NASA FIRMS sync
└── ai-service/     # Python + Flask — Deep learning & ML inference
```

| Service | Technology | Responsibility |
|---------|-----------|----------------|
| **Frontend** | React 18, Vite, Leaflet, Tailwind CSS | UI, map visualization, incident reporting |
| **Backend** | Java 21, Spring Boot 3, JWT | REST API, user management, satellite data sync |
| **AI Service** | Python, Flask, scikit-learn | Fire image detection, weather risk prediction |
| **Database** | PostgreSQL | Incidents, users, fire data |

### AI & Machine Learning

**Fire Image Detection (Deep Learning)**
- Trained on fire and smoke image datasets
- Classifies uploaded images: "Fire Detected", "Smoke Detected", or "No Fire"
- Integrated into the incident report submission flow

**Weather Risk Analysis (Random Forest)**
- Trained on historical weather and fire occurrence data for Turkey
- Input features: wind speed, humidity, temperature, rainfall
- Output: Canadian FWI score + fire probability percentage
- Training script: `train_weather_model.py`

### Getting Started

**Prerequisites:** Java 21+, Maven 3.9+, Node.js 20+, Python 3.10+, PostgreSQL

**1. Clone the repository**
```bash
git clone https://github.com/T-anay/Sylvanis.git
cd Sylvanis
```

**2. Start the AI service**
```bash
cd ai-service
pip install -r requirements.txt
# Configure .env (see Environment Variables)
python app/main.py
```
Runs on `http://localhost:5001`.

**3. Start the backend**
```bash
cd backend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`.

**4. Start the frontend**
```bash
cd frontend
npm install
npm run dev
```
Available at `http://localhost:5173`.

### Environment Variables

**Backend (`application-dev.properties`)**

| Variable | Description |
|----------|-------------|
| `spring.datasource.url` | PostgreSQL JDBC connection string |
| `spring.datasource.username` | Database username |
| `spring.datasource.password` | Database password |
| `jwt.secret` | JWT signing key |
| `nasa.firms.api-key` | API key from [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/map_key/) |
| `ai.service.url` | URL of the running AI service |

**AI Service (`.env`)**

| Variable | Description |
|----------|-------------|
| `MODEL_PATH` | Path to the trained model file |
| `FLASK_PORT` | Flask server port (default: 5001) |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## 🇹🇷 Türkçe

Sylvanis, Türkiye için geliştirilmiş yapay zeka destekli bir orman yangını tespit ve takip platformudur. **NASA FIRMS uydu verilerini**, **derin öğrenme tabanlı yangın görüntü tespitini** ve **Random Forest hava durumu risk analizini** bir araya getirerek orman yangınlarını gerçek zamanlı olarak tespit eder, tahmin eder ve haritalar.

Bir staj sürecinde geliştirilen bu proje, birbirinden bağımsız çalışabilen üç servis içeren mikroservis mimarisini sergilemektedir.

### Özellikler

- **Gerçek Zamanlı Uydu Verisi** — Türkiye bölgesi için filtrelenmiş NASA FIRMS API ile saatlik senkronizasyon
- **Derin Öğrenme ile Yangın Görüntü Tespiti** — Eğitilmiş derin öğrenme modeli, kullanıcı tarafından yüklenen görüntülerde yangın veya duman tespiti yapar
- **Random Forest Risk Analizi** — Geçmiş hava durumu verilerine (rüzgar hızı, nem, sıcaklık, yağış) dayalı eğitilmiş makine öğrenmesi modeli; Kanada FWI skoru ve yangın olasılığı hesaplar
- **İnteraktif Harita** — Termal noktaları, Türkiye'nin büyük şehirlerindeki hava istasyonlarını ve kullanıcı raporlarını gösteren Leaflet tabanlı harita
- **Güvenli Admin Paneli** — JWT kimlik doğrulamalı admin paneli ile yangın raporlarını yönetme
- **Kullanıcı Olay Bildirimi** — Kayıtlı kullanıcılar fotoğraflı yangın bildirimi yapabilir

### Mimari

```
Sylvanis/
├── frontend/       # React + Vite — Kullanıcı paneli ve interaktif harita
├── backend/        # Spring Boot 3 — REST API, kimlik doğrulama, uydu veri senkronizasyonu
└── ai-service/     # Python + Flask — Derin öğrenme ve ML çıkarımı
```

| Servis | Teknoloji | Sorumluluk |
|--------|-----------|------------|
| **Frontend** | React 18, Vite, Leaflet, Tailwind CSS | Arayüz, harita görselleştirme, olay bildirimi |
| **Backend** | Java 21, Spring Boot 3, JWT | REST API, kullanıcı yönetimi, uydu veri senkronizasyonu |
| **AI Servisi** | Python, Flask, scikit-learn | Yangın görüntü tespiti, hava risk tahmini |
| **Veritabanı** | PostgreSQL | Olaylar, kullanıcılar, yangın verileri |

### Yapay Zeka ve Makine Öğrenmesi

**Yangın Görüntü Tespiti (Derin Öğrenme)**
- Yangın ve duman görüntü veri setleri üzerinde eğitildi
- Yüklenen görüntüleri sınıflandırır: "Yangın Tespit Edildi", "Duman Tespit Edildi", "Yangın Yok"
- Olay bildirimi akışına entegre edildi

**Hava Durumu Risk Analizi (Random Forest)**
- Türkiye için geçmiş hava durumu ve yangın oluşum verileriyle eğitildi
- Girdi: Rüzgar hızı, nem, sıcaklık, yağış
- Çıktı: Kanada FWI skoru + yangın olasılık yüzdesi
- Eğitim betiği: `train_weather_model.py`

### Başlarken

**Gereksinimler:** Java 21+, Maven 3.9+, Node.js 20+, Python 3.10+, PostgreSQL

**1. Repoyu klonlayın**
```bash
git clone https://github.com/T-anay/Sylvanis.git
cd Sylvanis
```

**2. AI servisini başlatın**
```bash
cd ai-service
pip install -r requirements.txt
# .env dosyasını yapılandırın (Ortam Değişkenleri bölümüne bakın)
python app/main.py
```
`http://localhost:5001` adresinde çalışır.

**3. Backend'i başlatın**
```bash
cd backend
./mvnw spring-boot:run
```
`http://localhost:8080` adresinde çalışır.

**4. Frontend'i başlatın**
```bash
cd frontend
npm install
npm run dev
```
`http://localhost:5173` adresinde erişilebilir.
