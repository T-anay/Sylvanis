import os
import pandas as pd
import joblib
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import io
from PIL import Image

app = FastAPI(title="IGNIS AI Service")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEATHER_MODEL_PATH = os.path.join(ROOT_DIR, "weather_fire_model.pkl")
YOLO_MODEL_PATH = os.path.join(ROOT_DIR, "runs", "YOLOv11_Yangin_Hizli-3", "weights", "best.pt")

try:
    weather_model = joblib.load(WEATHER_MODEL_PATH)
    print(f"✅ Weather model loaded from {WEATHER_MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Could not load weather model: {e}")
    weather_model = None

try:
    vision_model = YOLO(YOLO_MODEL_PATH)
    print(f"✅ YOLO vision model loaded from {YOLO_MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Could not load YOLO model: {e}")
    vision_model = None


class WeatherData(BaseModel):
    Temperature: float
    RH: float
    Ws: float
    Rain: float
    FFMC: float
    DMC: float
    DC: float
    ISI: float

@app.get("/api/health")
def health_check():
    return {"status": "ok", "weather_model": weather_model is not None, "vision_model": vision_model is not None}

@app.post("/api/predict/weather")
def predict_weather(data: WeatherData):
    if weather_model is None:
        raise HTTPException(status_code=500, detail="Weather model is not loaded")
    
    # Preprocess data into DataFrame matching the model's training columns
    input_data = pd.DataFrame([{
        'Temperature': data.Temperature,
        'RH': data.RH,
        'Ws': data.Ws,
        'Rain': data.Rain,
        'FFMC': data.FFMC,
        'DMC': data.DMC,
        'DC': data.DC,
        'ISI': data.ISI
    }])
    
    prediction = weather_model.predict(input_data)[0]
    probability = weather_model.predict_proba(input_data)[0][1] # Probability of Class 1 (Fire)
    
    return {
        "risk_score": float(probability),
        "prediction": int(prediction),
        "is_fire_risk": bool(prediction == 1)
    }

@app.post("/api/predict/vision")
async def predict_vision(file: UploadFile = File(...)):
    if vision_model is None:
        raise HTTPException(status_code=500, detail="Vision model is not loaded")
    
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Run YOLO inference
        results = vision_model(image)
        
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                conf = float(box.conf[0])
                # Skip low-confidence detections (threshold: 45%) to prevent false positives
                if conf < 0.45:
                    continue
                    
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls = int(box.cls[0])
                label = vision_model.names[cls]
                
                detections.append({
                    "label": label,
                    "confidence": conf,
                    "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                })
        
        return {
            "detections": detections,
            "fire_detected": any(d["label"].lower() in ["fire", "smoke"] for d in detections)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
