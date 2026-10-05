import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Thermometer, Wind, Droplets, Leaf, Eye, Map as MapIcon, Activity, CloudRain, Sun, MapPin, Compass, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents, Polygon, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../contexts/ThemeContext';

// Fix Leaflet Default Icon Issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to force Leaflet to recalculate container size
const MapResizeHandler = () => {
  const map = useMap();
  React.useEffect(() => {
    // Invalidate immediately
    map.invalidateSize();
    // Invalidate again after layout finishes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const getYesterdayDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
};

const mockFwiData = [
  { value: 45 }, { value: 52 }, { value: 48 }, { value: 60 }, { value: 75 }, { value: 84.2 }
];

const officialFireIcon = new L.DivIcon({
  html: `<div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
           <div style="width: 14px; height: 14px; background-color: var(--error); border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239,68,68,0.8);"></div>
         </div>`,
  className: 'custom-icon',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const aiPredictionIcon = new L.DivIcon({
  html: `<div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); animation: pulse 1.5s infinite;">
           <svg width="34" height="34" viewBox="0 0 24 24" fill="darkorange" stroke="#fff" stroke-width="2">
             <path d="M12 2L2 22h20L12 2z" stroke-linejoin="round" />
           </svg>
           <span style="position: absolute; top: 11px; font-size: 8px; font-weight: 800; color: #fff; font-family: sans-serif;">AI</span>
         </div>`,
  className: 'custom-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

const userVerifiedIcon = new L.DivIcon({
  html: `<div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
           <svg width="34" height="34" viewBox="0 0 24 24" fill="#eab308" stroke="#fff" stroke-width="2">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
           </svg>
           <span style="position: absolute; top: 3px; font-size: 14px;">ğŸ”¥</span>
         </div>`,
  className: 'custom-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

const userPendingIcon = new L.DivIcon({
  html: `<div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
           <svg width="34" height="34" viewBox="0 0 24 24" fill="#3b82f6" stroke="#fff" stroke-width="2">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
           </svg>
           <span style="position: absolute; top: 3px; font-size: 14px;">ğŸ’¨</span>
         </div>`,
  className: 'custom-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

const getSpreadCone = (lat: number, lng: number, windDir: number, windSpeed: number): [number, number][] => {
  const blowingTo = (windDir + 180) % 360;
  const angleRad = blowingTo * (Math.PI / 180);
  const R = 0.15 + (windSpeed * 0.005);
  const p1: [number, number] = [lat, lng];
  const p2: [number, number] = [lat + R * Math.cos(angleRad - Math.PI/6), lng + R * Math.sin(angleRad - Math.PI/6)];
  const p3: [number, number] = [lat + R * Math.cos(angleRad + Math.PI/6), lng + R * Math.sin(angleRad + Math.PI/6)];
  return [p1, p2, p3];
};

const targetIcon = new L.DivIcon({
  html: `<div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
           <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--primary)" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
             <circle cx="12" cy="10" r="3" fill="#fff"></circle>
           </svg>
         </div>`,
  className: 'custom-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const getBlurredOverlayIcon = (color: string, size = 320) => {
  return new L.DivIcon({
    html: `<div style="width: ${size}px; height: ${size}px; background: ${color}; filter: blur(65px); opacity: 0.45; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;"></div>`,
    className: 'weather-blur-overlay',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const getTempIcon = (name: string, temp: number, color: string) => {
  return new L.DivIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
             <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid ${color}; padding: 3px 8px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; color: #fff; white-space: nowrap; box-shadow: 0 0 10px ${color}88;">
               ${Math.round(temp)}Â°
             </div>
             <div style="font-size: 0.65rem; color: #fff; text-shadow: 1px 1px 2px #000; font-weight: 600; margin-top: 2px; white-space: nowrap;">
               ${name}
             </div>
           </div>`,
    className: 'weather-temp-icon',
    iconSize: [40, 30],
    iconAnchor: [20, 15]
  });
};

const getWindIcon = (name: string, speed: number, dir: number, color: string) => {
  return new L.DivIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
             <div style="display: flex; align-items: center; background: rgba(15, 23, 42, 0.95); border: 2px solid ${color}; padding: 3px 8px; border-radius: 20px; gap: 4px; white-space: nowrap; color: #fff; box-shadow: 0 0 10px ${color}88;">
               <span style="font-size: 0.75rem; font-weight: bold;">${Math.round(speed)}</span>
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" style="transform: rotate(${dir}deg); transition: transform 0.5s; display: inline-block;">
                 <line x1="12" y1="5" x2="12" y2="19"></line>
                 <polyline points="19 12 12 19 5 12"></polyline>
               </svg>
             </div>
             <div style="font-size: 0.65rem; color: #fff; text-shadow: 1px 1px 2px #000; font-weight: 600; margin-top: 2px; white-space: nowrap;">
               ${name}
             </div>
           </div>`,
    className: 'weather-wind-icon',
    iconSize: [50, 30],
    iconAnchor: [25, 15]
  });
};

const getRainIcon = (name: string, rain: number, color: string) => {
  const hasRain = rain > 0;
  return new L.DivIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
             <div style="display: flex; align-items: center; background: rgba(15, 23, 42, 0.95); border: 2px solid ${color}; padding: 3px 8px; border-radius: 20px; gap: 4px; white-space: nowrap; color: #fff; box-shadow: 0 0 10px ${color}88;">
               <span>${hasRain ? 'ğŸŒ§ï¸' : 'â˜€ï¸'}</span>
               ${hasRain ? `<span style="font-size: 0.75rem; font-weight: bold;">${rain.toFixed(1)}</span>` : ''}
             </div>
             <div style="font-size: 0.65rem; color: #fff; text-shadow: 1px 1px 2px #000; font-weight: 600; margin-top: 2px; white-space: nowrap;">
               ${name}
             </div>
           </div>`,
    className: 'weather-rain-icon',
    iconSize: [50, 30],
    iconAnchor: [25, 15]
  });
};

const getHumidityIcon = (name: string, humidity: number, color: string) => {
  return new L.DivIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
             <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid ${color}; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; color: #fff; white-space: nowrap; box-shadow: 0 0 10px ${color}88;">
               %${humidity}
             </div>
             <div style="font-size: 0.65rem; color: #fff; text-shadow: 1px 1px 2px #000; font-weight: 600; margin-top: 2px; white-space: nowrap;">
               ${name}
             </div>
           </div>`,
    className: 'weather-humidity-icon',
    iconSize: [45, 30],
    iconAnchor: [22, 15]
  });
};

const getAiRiskIcon = (name: string, risk: number, color: string) => {
  return new L.DivIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
             <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid ${color}; padding: 3px 8px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; color: #fff; white-space: nowrap; box-shadow: 0 0 10px ${color}88; display: flex; align-items: center; gap: 3px;">
               <span>ğŸ¤–</span>
               <span>%${risk}</span>
             </div>
             <div style="font-size: 0.65rem; color: #fff; text-shadow: 1px 1px 2px #000; font-weight: 600; margin-top: 2px; white-space: nowrap;">
               ${name}
             </div>
           </div>`,
    className: 'weather-airisk-icon',
    iconSize: [45, 30],
    iconAnchor: [22, 15]
  });
};

const globalHotspots = [
  { name: 'Ä°stanbul', lat: 41.01, lng: 28.97 },
  { name: 'Ã‡anakkale', lat: 40.15, lng: 26.41 },
  { name: 'Bursa', lat: 40.18, lng: 29.06 },
  { name: 'Ä°zmir', lat: 38.42, lng: 27.14 },
  { name: 'MuÄŸla', lat: 37.21, lng: 28.36 },
  { name: 'AydÄ±n', lat: 37.85, lng: 27.84 },
  { name: 'Antalya', lat: 36.88, lng: 30.70 },
  { name: 'Mersin', lat: 36.81, lng: 34.64 },
  { name: 'Adana', lat: 37.00, lng: 35.32 },
  { name: 'Hatay', lat: 36.20, lng: 36.16 },
  { name: 'Ankara', lat: 39.93, lng: 32.85 },
  { name: 'Konya', lat: 37.87, lng: 32.49 },
  { name: 'Kayseri', lat: 38.72, lng: 35.48 },
  { name: 'Sivas', lat: 39.75, lng: 37.01 },
  { name: 'Samsun', lat: 41.29, lng: 36.33 },
  { name: 'Trabzon', lat: 41.00, lng: 39.72 },
  { name: 'Zonguldak', lat: 41.45, lng: 31.79 },
  { name: 'Erzurum', lat: 39.90, lng: 41.27 },
  { name: 'Malatya', lat: 38.35, lng: 38.31 },
  { name: 'DiyarbakÄ±r', lat: 37.91, lng: 40.24 },
  { name: 'ÅanlÄ±urfa', lat: 37.15, lng: 38.79 },
  { name: 'Gaziantep', lat: 37.06, lng: 37.38 },
  { name: 'Van', lat: 38.50, lng: 43.38 }
];

const defaultCameras: any[] = [];

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Custom Map Layer State
  const [activeLayer, setActiveLayer] = useState<'default' | 'temp' | 'rain' | 'wind' | 'humidity' | 'airisk'>('default');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [radarTileUrl, setRadarTileUrl] = useState<string>('');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Dynamic Location & Weather State
  const [selectedCity, setSelectedCity] = useState<string>('Global Average');
  const [clickedLocation, setClickedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [weatherStats, setWeatherStats] = useState({
    temp: 22,
    wind: 15,
    humidity: 50,
    soilMoisture: 0.25,
    windDir: 180,
    precip: 0,
    fwi: 12,
    trend: [10, 12, 15, 12, 10, 12]
  });
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // New Map Data States
  const [incidents, setIncidents] = useState<any[]>([]);
  const [officialFires, setOfficialFires] = useState<any[]>([]);
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [stationWeather, setStationWeather] = useState<any[]>([]);

  // Fetch weather stations data on mount
  React.useEffect(() => {
    const fetchStations = async () => {
      const stations = [
        { name: 'Ä°stanbul', lat: 41.01, lng: 28.97, tempFallback: 24, windDirFallback: 45, windSpeedFallback: 18, rainFallback: 0, humidityFallback: 65 },
        { name: 'Ankara', lat: 39.93, lng: 32.85, tempFallback: 26, windDirFallback: 180, windSpeedFallback: 12, rainFallback: 0, humidityFallback: 45 },
        { name: 'Ä°zmir', lat: 38.42, lng: 27.14, tempFallback: 29, windDirFallback: 270, windSpeedFallback: 20, rainFallback: 0, humidityFallback: 50 },
        { name: 'Antalya', lat: 36.88, lng: 30.70, tempFallback: 32, windDirFallback: 135, windSpeedFallback: 15, rainFallback: 0.1, humidityFallback: 60 },
        { name: 'MuÄŸla', lat: 37.21, lng: 28.36, tempFallback: 30, windDirFallback: 220, windSpeedFallback: 25, rainFallback: 0, humidityFallback: 52 },
        { name: 'Adana', lat: 37.00, lng: 35.32, tempFallback: 33, windDirFallback: 90, windSpeedFallback: 10, rainFallback: 0.5, humidityFallback: 55 },
        { name: 'Trabzon', lat: 41.00, lng: 39.72, tempFallback: 22, windDirFallback: 315, windSpeedFallback: 14, rainFallback: 2.3, humidityFallback: 80 },
        { name: 'DiyarbakÄ±r', lat: 37.91, lng: 40.24, tempFallback: 38, windDirFallback: 160, windSpeedFallback: 8, rainFallback: 0, humidityFallback: 25 },
        { name: 'Erzurum', lat: 39.90, lng: 41.27, tempFallback: 18, windDirFallback: 240, windSpeedFallback: 16, rainFallback: 0, humidityFallback: 35 },
        { name: 'Ã‡anakkale', lat: 40.15, lng: 26.41, tempFallback: 25, windDirFallback: 30, windSpeedFallback: 22, rainFallback: 0, humidityFallback: 60 },
        { name: 'Athens', lat: 37.98, lng: 23.72, tempFallback: 28, windDirFallback: 190, windSpeedFallback: 14, rainFallback: 0, humidityFallback: 50 },
        { name: 'Cairo', lat: 30.04, lng: 31.23, tempFallback: 37, windDirFallback: 350, windSpeedFallback: 12, rainFallback: 0, humidityFallback: 30 },
        { name: 'Nicosia', lat: 35.18, lng: 33.38, tempFallback: 31, windDirFallback: 200, windSpeedFallback: 15, rainFallback: 0, humidityFallback: 55 }
      ];

      const loaded = await Promise.all(stations.map(async (st) => {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${st.lat}&longitude=${st.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation`);
          if (res.ok) {
            const data = await res.json();
            if (data.current) {
              return {
                ...st,
                temp: data.current.temperature_2m,
                windSpeed: data.current.wind_speed_10m,
                windDir: data.current.wind_direction_10m,
                rain: data.current.precipitation,
                humidity: data.current.relative_humidity_2m
              };
            }
          }
        } catch (e) {
          console.warn("Failed to fetch weather for station", st.name);
        }
        return {
          ...st,
          temp: st.tempFallback,
          windSpeed: st.windSpeedFallback,
          windDir: st.windDirFallback,
          rain: st.rainFallback,
          humidity: st.humidityFallback
        };
      }));

      setStationWeather(loaded);
    };

    fetchStations();
  }, []);

  // Fetch RainViewer timestamp
  React.useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          const latestTs = data.radar.past[data.radar.past.length - 1].time;
          setRadarTileUrl(`https://tilecache.rainviewer.com/v2/radar/${latestTs}/256/{z}/{x}/{y}/2/1_1.png`);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch RainViewer timestamp, using fallback", err);
        setRadarTileUrl("https://tilecache.rainviewer.com/v2/radar/1700000000/256/{z}/{x}/{y}/2/1_1.png");
      });
  }, []);

  // Fetch live Map Data & Run Global AI Risk Scanner
  React.useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [incRes, offRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/incidents`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/map-data/official-fires`)
        ]);
        if (incRes.ok) setIncidents(await incRes.json());
        if (offRes.ok) setOfficialFires(await offRes.json());
      } catch (err) {
        console.warn("Backend down, using mock data for incidents & official fires");
        setOfficialFires([
          { latitude: 37.05, longitude: 28.25, source: "NASA_FIRMS", severity: "HIGH", windSpeed: 45.0, windDirection: 180.0 },
          { latitude: 36.85, longitude: 30.70, source: "ESRI", severity: "CRITICAL", windSpeed: 60.0, windDirection: 220.0 },
          { latitude: 38.42, longitude: 27.14, source: "NASA_FIRMS", severity: "MEDIUM", windSpeed: 30.0, windDirection: 90.0 }
        ]);
        setIncidents([
          { latitude: 36.9, longitude: 28.5, aiConfirmedFire: true, reporterName: "Ahmet YÄ±lmaz", intensity: "High", windSpeed: 25.0, windDirection: 135.0 },
          { latitude: 37.2, longitude: 30.1, aiConfirmedFire: false, reporterName: "AyÅŸe K.", intensity: "Small", windSpeed: 10.0, windDirection: 270.0 }
        ]);
      }
    };

    const runGlobalScanner = async () => {
      try {
        const predictions = await Promise.all(globalHotspots.map(async (spot) => {
          try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,wind_direction_10m`);
            if (!weatherRes.ok) return null;
            const wData = await weatherRes.json();
            if (!wData.current) return null;

            const temp = wData.current.temperature_2m;
            const rh = wData.current.relative_humidity_2m;
            const ws = wData.current.wind_speed_10m;
            const rain = wData.current.precipitation;
            const windDir = wData.current.wind_direction_10m || 0;

            // Compute realistic FWI components
            const ffmc = Math.max(30, Math.min(99, 40 + (temp * 1.2) - (rh * 0.2) - (rain * 5)));
            const dmc = Math.max(5, Math.min(60, (temp * 0.8) - (rh * 0.1) - (rain * 2)));
            const dc = Math.max(10, Math.min(400, (temp * 3) - (rh * 0.5) - (rain * 10)));
            const isi = Math.max(0.5, Math.min(25, (ws * 0.2) + (ffmc - 40) * 0.1));

            let hasRisk = false;
            let riskScore = 0;
            try {
              // Call real ML model API
              const apiRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/weather/risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  Temperature: temp,
                  RH: rh,
                  Ws: ws,
                  Rain: rain,
                  FFMC: ffmc,
                  DMC: dmc,
                  DC: dc,
                  ISI: isi
                })
              });

              if (apiRes.ok) {
                const riskData = await apiRes.json();
                hasRisk = riskData.is_fire_risk || riskData.risk_score > 0.7;
                riskScore = riskData.risk_score;
              } else {
                throw new Error("API call returned non-OK status");
              }
            } catch (apiErr) {
              // Fallback to FWI formula calculation if backend/model is offline
              let calc = (temp * 1.5) + (ws * 0.8) - (rh * 0.4);
              hasRisk = calc > 35;
              riskScore = Math.max(5, Math.min(99, calc)) / 100;
            }

            return {
              name: spot.name,
              latitude: spot.lat,
              longitude: spot.lng,
              riskPercentage: Math.round(riskScore * 100),
              windDirection: windDir,
              windSpeed: ws,
              reason: `Live weather: Temp: ${Math.round(temp)}Â°C, Humidity: ${Math.round(rh)}%, Wind: ${Math.round(ws)} km/h. AI predicted risk.`
            };
          } catch (e) {
            console.warn("Failed to check risk for", spot.name, e);
          }
          return null;
        }));

        setAiPredictions(predictions.filter(p => p !== null));
      } catch (err) {
        console.error("Global scanner failed", err);
      }
    };

    fetchMapData();
    runGlobalScanner();
  }, []);

  // Dynamic Camera State (LocalStorage)
  const [cameras, setCameras] = React.useState<any[]>([]);

  // Load cameras on mount (use defaultCameras if empty)
  React.useEffect(() => {
    const saved = localStorage.getItem('sylvanis_cameras');
    let loadedCameras = [];
    if (saved) {
      try {
        loadedCameras = JSON.parse(saved);
        // Filter out default cameras
        loadedCameras = loadedCameras.filter((c: any) => !c.id.startsWith('default-cam-'));
      } catch (e) {
        console.error("Failed to parse cameras", e);
      }
    }
    
    localStorage.setItem('sylvanis_cameras', JSON.stringify(loadedCameras));
    setCameras(loadedCameras);
  }, []);

  // Scan cameras using YOLO AI Service
  React.useEffect(() => {
    if (cameras.length === 0) return;
    
    const camerasToAnalyze = cameras.filter(c => c.aiScore === t('dashboard.analyzing', 'Analyzing...'));
    if (camerasToAnalyze.length === 0) return;

    const runAnalysis = async () => {
      let updatedAny = false;
      const updatedCameras = await Promise.all(cameras.map(async (cam) => {
        if (cam.aiScore === t('dashboard.analyzing', 'Analyzing...')) {
          if (cam.url.includes('youtube.com') || cam.url.includes('vimeo.com') || cam.url.includes('youtu.be')) {
            updatedAny = true;
            return { ...cam, status: 'clear', aiScore: t('dashboard.live_video', 'Live Video') };
          }
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/incidents/analyze-camera?url=${encodeURIComponent(cam.url)}`);
            if (res.ok) {
              const data = await res.json();
              updatedAny = true;
              
              if (data && data.detections && data.detections.length > 0) {
                const bestMatch = data.detections.reduce((max: any, d: any) => d.confidence > max.confidence ? d : max, data.detections[0]);
                const isFire = bestMatch.label.toLowerCase() === 'fire';
                const confidencePercent = Math.round(bestMatch.confidence * 100);
                
                return {
                  ...cam,
                  status: isFire ? 'fire' : 'smoke',
                  aiScore: `${isFire ? t('dashboard.fire', 'Fire') : t('dashboard.smoke', 'Smoke')} (${confidencePercent}%)`
                };
              } else {
                return {
                  ...cam,
                  status: 'clear',
                  aiScore: `${t('dashboard.clear', 'Clear')} (100%)`
                };
              }
            } else {
              updatedAny = true;
              return {
                ...cam,
                status: 'clear',
                aiScore: t('dashboard.offline', 'Offline')
              };
            }
          } catch (err) {
            console.warn("Failed to analyze camera:", cam.name, err);
            updatedAny = true;
            return { ...cam, status: 'clear', aiScore: t('dashboard.offline', 'Offline') };
          }
        }
        return cam;
      }));

      if (updatedAny) {
        setCameras(updatedCameras);
        localStorage.setItem('sylvanis_cameras', JSON.stringify(updatedCameras));
      }
    };

    runAnalysis();
  }, [cameras]);

  const [isAddCameraModalOpen, setIsAddCameraModalOpen] = React.useState(false);
  const [newCamera, setNewCamera] = React.useState({ name: '', region: '', url: '' });

  const handleAddCamera = () => {
    if (newCamera.name && newCamera.url) {
      const isVideo = newCamera.url.includes('youtube.com') || newCamera.url.includes('vimeo.com') || newCamera.url.includes('youtu.be');
      const isImg = newCamera.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || newCamera.url.includes('images.unsplash.com') || newCamera.url.includes('picsum.photos') || newCamera.url.startsWith('data:image/');
      
      let initialStatus = 'clear';
      let initialAiScore = t('dashboard.analyzing', 'Analyzing...');
      
      if (!isVideo && !isImg) {
        const proceed = window.confirm(t('dashboard.camera_warning', "Bu adres doÄŸrudan bir video akÄ±ÅŸÄ± (YouTube/Vimeo) veya gÃ¶rsel linki (.jpg/.png) deÄŸil. KamerayÄ± ekleyebilirsiniz ancak Yapay Zeka bu kamerayÄ± otomatik tarayamayacak ve sadece iframe penceresi olarak yÃ¼klenecektir. Devam etmek istiyor musunuz?"));
        if (!proceed) return;
        initialAiScore = t('dashboard.web_page', 'Web Page');
      }

      const embeddedUrl = getEmbedUrl(newCamera.url);

      const updatedCameras = [
        ...cameras, 
        { 
          id: Math.random().toString(), 
          name: newCamera.name, 
          region: newCamera.region || 'Unknown', 
          status: initialStatus, 
          aiScore: initialAiScore, 
          url: embeddedUrl 
        }
      ];
      setCameras(updatedCameras);
      localStorage.setItem('sylvanis_cameras', JSON.stringify(updatedCameras));
      setIsAddCameraModalOpen(false);
      setNewCamera({ name: '', region: '', url: '' });
    }
  };

  const removeCamera = (id: string) => {
    const updated = cameras.filter(c => c.id !== id);
    setCameras(updated);
    localStorage.setItem('sylvanis_cameras', JSON.stringify(updated));
  };

  // Map Click Handler Component
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setClickedLocation({ lat, lng });
        setIsLoadingWeather(true);
        setSelectedCity('Locating...');
        
        try {
          // 1. Get City Name
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown Location';
          setSelectedCity(city);

          // 2. Get Real Weather (Open-Meteo)
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation&hourly=soil_moisture_0_to_1cm`);
          const weatherData = await weatherRes.json();
          
          if (weatherData.current) {
            const temp = weatherData.current.temperature_2m;
            const humidity = weatherData.current.relative_humidity_2m;
            const wind = weatherData.current.wind_speed_10m;
            const windDir = weatherData.current.wind_direction_10m;
            const precip = weatherData.current.precipitation;
            const soil = weatherData.hourly?.soil_moisture_0_to_1cm?.[new Date().getHours()] || 0.2;
            
            // Compute realistic FWI components dynamically
            const ffmc = Math.max(30, Math.min(99, 40 + (temp * 1.2) - (humidity * 0.2) - (precip * 5)));
            const dmc = Math.max(5, Math.min(60, (temp * 0.8) - (humidity * 0.1) - (precip * 2)));
            const dc = Math.max(10, Math.min(400, (temp * 3) - (humidity * 0.5) - (precip * 10)));
            const isi = Math.max(0.5, Math.min(25, (wind * 0.2) + (ffmc - 40) * 0.1));

            // Query real ML model endpoint
            let riskScore = 0;
            try {
              const riskRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/weather/risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  Temperature: temp,
                  RH: humidity,
                  Ws: wind,
                  Rain: precip,
                  FFMC: ffmc,
                  DMC: dmc,
                  DC: dc,
                  ISI: isi
                })
              });
              if (riskRes.ok) {
                const riskData = await riskRes.json();
                riskScore = Math.round(riskData.risk_score * 100);
              } else {
                throw new Error("API failure");
              }
            } catch (e) {
              let calc = (temp * 1.5) + (wind * 0.8) - (humidity * 0.4) - (soil * 100);
              riskScore = Math.round(Math.max(5, Math.min(99, calc)));
            }

            // Check if there is an active official fire or user-confirmed report within 0.15 degrees (~15km)
            const hasNearbyFire = officialFires.some(f => Math.abs(f.latitude - lat) < 0.15 && Math.abs(f.longitude - lng) < 0.15) ||
                                  incidents.some(i => i.aiConfirmedFire && Math.abs(i.latitude - lat) < 0.15 && Math.abs(i.longitude - lng) < 0.15);
            
            if (hasNearbyFire) {
              riskScore = Math.max(riskScore, 85); // Boost to Extreme Risk (85%) because there is an active fire!
            }
            
            const trend = [
              Math.max(5, Math.min(99, riskScore - (Math.random() * 30 - 10))),
              Math.max(5, Math.min(99, riskScore - (Math.random() * 20))),
              Math.max(5, Math.min(99, riskScore - (Math.random() * 10))),
              riskScore,
              Math.max(5, Math.min(99, riskScore + (Math.random() * 15 - 5))),
              Math.max(5, Math.min(99, riskScore + (Math.random() * 20 - 10)))
            ].map(Math.round);

            setWeatherStats({
              temp: Math.round(temp),
              wind: Math.round(wind),
              humidity: Math.round(humidity),
              soilMoisture: Number(soil.toFixed(2)),
              windDir: windDir,
              precip: precip,
              fwi: riskScore,
              trend: trend
            });
          }
        } catch (error) {
          console.error("Failed to fetch location data", error);
          setSelectedCity('Offline Data');
        } finally {
          setIsLoadingWeather(false);
        }
      }
    });
    return null;
  };


  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '2rem', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
              <Activity color="var(--primary)" /> {t('dashboard.title')}
            </h1>
          </div>
        </header>

        {/* 3-Column Layout */}
        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', minHeight: '600px' }}>
          
          {/* Left Panel: Stats */}
          <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Dynamic Location Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <MapPin size={24} />
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {selectedCity}
              </h2>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {isLoadingWeather && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', backdropFilter: 'blur(2px)' }}>
                  {t('dashboard.loading_data', 'Loading Live Data...')}
                </div>
              )}

              <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, fontSize: '1.1rem', borderBottom: '1px solid var(--outline)', paddingBottom: '1rem' }}>
                <AlertTriangle size={20} /> {t('dashboard.risks')}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', textAlign: 'center', fontSize: '0.9rem' }}>{t('dashboard.fwi')}</p>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(${weatherStats.fwi > 50 ? 'var(--error)' : weatherStats.fwi > 20 ? 'orange' : 'var(--primary)'} ${weatherStats.fwi}%, var(--surface-variant) 0)`, padding: '10px' }}>
                  <div style={{ background: 'var(--surface)', width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                     <span style={{ fontSize: '2.5rem', fontWeight: 900, color: weatherStats.fwi > 50 ? 'var(--error)' : weatherStats.fwi > 20 ? 'orange' : 'var(--primary)', lineHeight: 1 }}>{weatherStats.fwi}</span>
                  </div>
                </div>
                <div style={{ background: weatherStats.fwi > 50 ? 'var(--error-container)' : weatherStats.fwi > 20 ? 'rgba(255,165,0,0.2)' : 'var(--primary-container)', color: weatherStats.fwi > 50 ? 'var(--on-error-container)' : weatherStats.fwi > 20 ? 'orange' : 'var(--on-primary-container)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '1rem', letterSpacing: '1px' }}>
                  {weatherStats.fwi > 50 ? t('dashboard.risk_extreme', 'EXTREME RISK') : weatherStats.fwi > 20 ? t('dashboard.risk_moderate', 'MODERATE RISK') : t('dashboard.risk_low', 'LOW RISK')}
                </div>
              </div>
              
              {/* Fake Line Chart */}
              <div style={{ height: '80px', margin: '1rem 0 2rem 0', width: '100%' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>{t('dashboard.trend_24h')}</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { name: '00', val: weatherStats.trend[0] }, 
                    { name: '04', val: weatherStats.trend[1] }, 
                    { name: '08', val: weatherStats.trend[2] },
                    { name: '12', val: weatherStats.trend[3] }, 
                    { name: '16', val: weatherStats.trend[4] }, 
                    { name: '20', val: weatherStats.trend[5] }
                  ]}>
                    <YAxis domain={[0, 100]} hide />
                    <Line type="monotone" dataKey="val" stroke={weatherStats.fwi > 50 ? 'var(--error)' : weatherStats.fwi > 20 ? 'orange' : 'var(--primary)'} strokeWidth={3} dot={{ r: 3, fill: weatherStats.fwi > 50 ? 'var(--error)' : weatherStats.fwi > 20 ? 'orange' : 'var(--primary)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Grid for Factors (2 cols x 3 rows) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: 'auto' }}>
                <div style={{ background: 'var(--surface-variant)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Thermometer color="var(--primary)" size={24} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{weatherStats.temp}Â°C</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('dashboard.temperature')}</div>
                </div>
                <div style={{ background: 'var(--surface-variant)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Wind color="var(--primary)" size={24} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{weatherStats.wind} km/h</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('dashboard.wind_speed')}</div>
                </div>
                <div style={{ background: 'var(--surface-variant)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Droplets color="var(--primary)" size={24} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{weatherStats.humidity}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('dashboard.humidity')}</div>
                </div>
                <div style={{ background: 'var(--surface-variant)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Leaf color="var(--primary)" size={24} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{weatherStats.soilMoisture < 0.3 ? t('dashboard.soil_dry', 'Dry') : t('dashboard.soil_moist', 'Moist')}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('dashboard.soil_moisture')}</div>
                </div>
                <div style={{ background: 'var(--surface-variant)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Compass color="var(--primary)" size={24} style={{ marginBottom: '0.5rem', transform: `rotate(${weatherStats.windDir}deg)`, transition: 'transform 0.5s ease' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                    {weatherStats.windDir >= 337.5 || weatherStats.windDir < 22.5 ? 'N' :
                     weatherStats.windDir >= 22.5 && weatherStats.windDir < 67.5 ? 'NE' :
                     weatherStats.windDir >= 67.5 && weatherStats.windDir < 112.5 ? 'E' :
                     weatherStats.windDir >= 112.5 && weatherStats.windDir < 157.5 ? 'SE' :
                     weatherStats.windDir >= 157.5 && weatherStats.windDir < 202.5 ? 'S' :
                     weatherStats.windDir >= 202.5 && weatherStats.windDir < 247.5 ? 'SW' :
                     weatherStats.windDir >= 247.5 && weatherStats.windDir < 292.5 ? 'W' : 'NW'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('dashboard.wind_direction')} ({weatherStats.windDir}Â°)</div>
                </div>
                <div style={{ background: 'var(--surface-variant)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <CloudRain color="var(--primary)" size={24} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{weatherStats.precip} mm</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('dashboard.precipitation')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: Map (Col Span 6) */}
          <div className="map-container glass-panel" style={{ gridColumn: 'span 6', position: 'relative', overflow: 'hidden' }}>
            {/* Header Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem 1.5rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', zIndex: 1000, display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem', color: 'white' }}>
                <MapIcon color="var(--primary)" size={20} /> {t('dashboard.regional_situation')}
              </h2>
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsLegendOpen(!isLegendOpen)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)' }}
                  title="Harita Ä°ÅŸaretleri AnlamlarÄ±"
                >
                  <Info size={20} />
                </button>
                
                {isLegendOpen && (
                  <div className="glass-panel" style={{ position: 'absolute', top: '120%', right: 0, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '280px', zIndex: 2000 }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', borderBottom: '1px solid var(--outline)', paddingBottom: '0.5rem', marginBottom: '0.2rem' }}>{t('dashboard.legend_title', 'Harita Ä°ÅŸaretleri')}</h3>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-color)' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--error)' }}></span> {t('dashboard.legend_official_fire', 'Resmi YangÄ±n')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-color)' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }}></span> {t('dashboard.legend_ai_detected', 'KullanÄ±cÄ± Ä°hbarÄ± (AI OnaylÄ±)')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-color)' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></span> {t('dashboard.legend_ai_not_detected', 'KullanÄ±cÄ± Ä°hbarÄ± (Onay Bekliyor)')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-color)' }}>
                      <span style={{ width: 16, height: 12, background: '#eab308', opacity: 0.5, border: '1px dashed #eab308' }}></span> {t('dashboard.legend_spread_area', 'Tahmini YayÄ±lma BÃ¶lgesi')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Overlay */}
            <div className="glass-panel" style={{ position: 'absolute', top: '70px', right: '20px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', zIndex: 1000, minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-color)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--error)' }}></span> {t('dashboard.stat_nasa', 'Uydu IsÄ± NoktasÄ±')}
                </span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>{officialFires.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-color)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }}></span> {t('dashboard.stat_ai_fire', 'OnaylanmÄ±ÅŸ Ä°hbar')}
                </span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>{incidents.filter(i => i.aiConfirmedFire).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-color)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span> {t('dashboard.stat_ai_pending', 'OnaylanmamÄ±ÅŸ Ä°hbar')}
                </span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>{incidents.filter(i => !i.aiConfirmedFire).length}</span>
              </div>
            </div>

            {/* Leaflet MapContainer */}
            <MapContainer 
              center={[39.0, 35.0]} 
              zoom={6} 
              minZoom={3}
              maxBounds={[[-90, -180], [90, 180]]}
              maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%', minHeight: '500px', cursor: 'crosshair' }} 
              zoomControl={false}
            >
              <MapClickHandler />
              <MapResizeHandler />
              
              {/* Static Base Map Layer */}
              <TileLayer
                noWrap={true}
                url={theme === 'dark' ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              />

              {/* Rain Radar Overlay */}
              {activeLayer === 'rain' && radarTileUrl && (
                <TileLayer
                  noWrap={true}
                  url={radarTileUrl}
                  opacity={0.8}
                  attribution='&copy; <a href="https://www.rainviewer.com/">RainViewer Radar</a>'
                />
              )}

              {/* NASA FIRMS Live Active Fires Overlay (Combined Satellite Layers) */}
              {activeLayer === 'default' && (
                <>
                  <TileLayer
                    noWrap={true}
                    url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_Thermal_Anomalies_375m_All/default/${getYesterdayDateStr()}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`}
                    opacity={0.85}
                    attribution='&copy; NASA GIBS VIIRS SNPP'
                  />
                  <TileLayer
                    noWrap={true}
                    url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_Thermal_Anomalies_375m_All/default/${getYesterdayDateStr()}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`}
                    opacity={0.85}
                    attribution='&copy; NASA GIBS VIIRS NOAA-20'
                  />
                  <TileLayer
                    noWrap={true}
                    url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_All/default/${getYesterdayDateStr()}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`}
                    opacity={0.85}
                    attribution='&copy; NASA GIBS MODIS Terra'
                  />
                </>
              )}
              {/* Official Fires & Spread Cones (Only in Normal Mode) */}
              {activeLayer === 'default' && officialFires.map((fire, i) => (
                <React.Fragment key={`off-${i}`}>
                  <Marker position={[fire.latitude, fire.longitude]} icon={officialFireIcon}>
                    <Popup>
                      <strong>ğŸ“¡ {t('dashboard.legend_official_fire', 'NASA YÃ¼ksek IsÄ± NoktasÄ±')}</strong><br/>
                      Source: {fire.source}<br/>
                      Severity: {fire.severity}
                    </Popup>
                  </Marker>
                  <Polygon 
                    positions={getSpreadCone(fire.latitude, fire.longitude, fire.windDirection, fire.windSpeed)} 
                    pathOptions={{ color: 'red', fillColor: 'orange', fillOpacity: 0.2, weight: 1, dashArray: '4' }} 
                  />
                </React.Fragment>
              ))}


              {/* User Reported Incidents (Only in Normal Mode) */}
              {activeLayer === 'default' && incidents.map((inc, i) => (
                <React.Fragment key={`inc-${i}`}>
                  <Marker position={[inc.latitude, inc.longitude]} icon={inc.aiConfirmedFire ? userVerifiedIcon : userPendingIcon}>
                    <Popup>
                      <strong>{inc.aiConfirmedFire ? 'ğŸ”¥ Yapay Zeka OnaylÄ± YangÄ±n' : 'âš ï¸ Ä°nceleme Bekliyor'}</strong><br/>
                      Bildiren: {inc.reporterName || 'Anonim'}<br/>
                      Åiddet: {inc.intensity === 'High' || inc.intensity === 'Large' ? 'YÃ¼ksek' : 
                               inc.intensity === 'Medium' ? 'Orta' : 'DÃ¼ÅŸÃ¼k'}
                    </Popup>
                  </Marker>
                  {inc.aiConfirmedFire && (
                    <Polygon 
                      positions={getSpreadCone(inc.latitude, inc.longitude, inc.windDirection || 180.0, inc.windSpeed || 15.0)} 
                      pathOptions={{ color: '#eab308', fillColor: '#fef08a', fillOpacity: 0.35, weight: 1.5, dashArray: '4' }} 
                    />
                  )}
                </React.Fragment>
              ))}

              {/* Clicked Location Marker (Only in Normal Mode) */}
              {activeLayer === 'default' && clickedLocation && (
                <Marker position={[clickedLocation.lat, clickedLocation.lng]} icon={targetIcon} />
              )}

              {/* Meteorological Weather Overlays (Blurred Gradients + Markers) */}
              {activeLayer === 'temp' && stationWeather.map((st, idx) => {
                const color = st.temp > 35 ? '#dc2626' : 
                              st.temp > 28 ? '#f97316' : 
                              st.temp > 22 ? '#eab308' : 
                              st.temp > 15 ? '#22c55e' : 
                              '#2563eb';
                return (
                  <React.Fragment key={`temp-st-${idx}`}>
                    <Marker position={[st.lat, st.lng]} icon={getBlurredOverlayIcon(color + '55', 380)} />
                    <Marker position={[st.lat, st.lng]} icon={getTempIcon(st.name, st.temp, color)}>
                      <Popup>
                        <strong>ğŸŒ¡ï¸ {st.name} SÄ±caklÄ±k</strong><br/>
                        SÄ±caklÄ±k: {st.temp}Â°C
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}

              {activeLayer === 'wind' && stationWeather.map((st, idx) => {
                const color = st.windSpeed > 30 ? '#7e22ce' : 
                              st.windSpeed > 20 ? '#2563eb' : 
                              st.windSpeed > 10 ? '#10b981' : 
                              '#15803d';
                return (
                  <React.Fragment key={`wind-st-${idx}`}>
                    <Marker position={[st.lat, st.lng]} icon={getBlurredOverlayIcon(color + '55', 380)} />
                    <Marker position={[st.lat, st.lng]} icon={getWindIcon(st.name, st.windSpeed, st.windDir, color)}>
                      <Popup>
                        <strong>ğŸ’¨ {st.name} RÃ¼zgar HÄ±zÄ±</strong><br/>
                        RÃ¼zgar HÄ±zÄ±: {st.windSpeed} km/h<br/>
                        RÃ¼zgar YÃ¶nÃ¼: {st.windDir}Â°
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}

              {activeLayer === 'rain' && stationWeather.map((st, idx) => {
                const color = st.rain > 2.0 ? '#c026d3' : 
                              st.rain > 0.5 ? '#7e22ce' : 
                              st.rain > 0.0 ? '#2563eb' : 
                              'transparent';
                return (
                  <React.Fragment key={`rain-st-${idx}`}>
                    {color !== 'transparent' && (
                      <Marker position={[st.lat, st.lng]} icon={getBlurredOverlayIcon(color + '55', 380)} />
                    )}
                    <Marker position={[st.lat, st.lng]} icon={getRainIcon(st.name, st.rain, color === 'transparent' ? '#475569' : color)}>
                      <Popup>
                        <strong>ğŸŒ§ï¸ {st.name} YaÄŸÄ±ÅŸ Durumu</strong><br/>
                        YaÄŸÄ±ÅŸ MiktarÄ±: {st.rain} mm
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}

              {activeLayer === 'humidity' && stationWeather.map((st, idx) => {
                const color = st.humidity > 75 ? '#1d4ed8' : 
                              st.humidity > 55 ? '#2563eb' : 
                              st.humidity > 35 ? '#0d9488' : 
                              '#ca8a04';
                return (
                  <React.Fragment key={`hum-st-${idx}`}>
                    <Marker position={[st.lat, st.lng]} icon={getBlurredOverlayIcon(color + '55', 380)} />
                    <Marker position={[st.lat, st.lng]} icon={getHumidityIcon(st.name, st.humidity || 50, color)}>
                      <Popup>
                        <strong>ğŸ’§ {st.name} Nem OranÄ±</strong><br/>
                        BaÄŸÄ±l Nem: %{st.humidity || 50}
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}

              {activeLayer === 'airisk' && aiPredictions.map((pred, idx) => {
                const color = pred.riskPercentage > 80 ? '#dc2626' : 
                              pred.riskPercentage > 60 ? '#ea580c' : 
                              pred.riskPercentage > 40 ? '#eab308' : 
                              pred.riskPercentage > 20 ? '#22c55e' : 
                              '#2563eb';
                return (
                  <React.Fragment key={`airisk-st-${idx}`}>
                    <Marker position={[pred.latitude, pred.longitude]} icon={getBlurredOverlayIcon(color + '55', 380)} />
                    <Marker position={[pred.latitude, pred.longitude]} icon={getAiRiskIcon(pred.name || `Hotspot ${idx}`, pred.riskPercentage, color)}>
                      <Popup>
                        <strong>ğŸ¤– AI Fire Risk Prediction</strong><br/>
                        Risk OranÄ±: %{pred.riskPercentage}<br/>
                        AÃ§Ä±klama: {pred.reason}
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>

            {/* Weather Overlay Legends (Floating on Map) */}
            {activeLayer === 'temp' && (
              <div className="glass-panel" style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '0.8rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--outline)' }}>
                <strong style={{ color: 'var(--primary)' }}>ğŸŒ¡ï¸ SÄ±caklÄ±k Ã–lÃ§eÄŸi</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }}></div>
                  <span>Ã‡ok SÄ±cak (&gt;35Â°C)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316' }}></div>
                  <span>SÄ±cak (28 - 35Â°C)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
                  <span>IlÄ±k (22 - 28Â°C)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
                  <span>Serin (15 - 22Â°C)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                  <span>SoÄŸuk (&lt;15Â°C)</span>
                </div>
              </div>
            )}

            {activeLayer === 'wind' && (
              <div className="glass-panel" style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '0.8rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--outline)', maxWidth: '200px' }}>
                <strong style={{ color: 'var(--primary)' }}>ğŸ’¨ RÃ¼zgar HÄ±zÄ± Ã–lÃ§eÄŸi</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7e22ce' }}></div>
                  <span>FÄ±rtÄ±na (&gt;30 km/h)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                  <span>Kuvvetli (20 - 30 km/h)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span>Orta (10 - 20 km/h)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#15803d' }}></div>
                  <span>Hafif (&lt;10 km/h)</span>
                </div>
              </div>
            )}

            {activeLayer === 'rain' && (
              <div className="glass-panel" style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '0.8rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--outline)' }}>
                <strong style={{ color: 'var(--primary)' }}>ğŸŒ§ï¸ YaÄŸÄ±ÅŸ MiktarÄ±</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#c026d3' }}></div>
                  <span>Åiddetli YaÄŸÄ±ÅŸ (&gt;2.0 mm)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7e22ce' }}></div>
                  <span>Orta YaÄŸÄ±ÅŸ (0.5 - 2.0 mm)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                  <span>Hafif YaÄŸÄ±ÅŸ (&gt;0 mm)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#475569' }}></div>
                  <span>YaÄŸÄ±ÅŸ Yok (0 mm)</span>
                </div>
              </div>
            )}

            {activeLayer === 'humidity' && (
              <div className="glass-panel" style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '0.8rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--outline)' }}>
                <strong style={{ color: 'var(--primary)' }}>ğŸ’§ BaÄŸÄ±l Nem OranÄ±</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                  <span>Ã‡ok Nemli (&gt;75%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                  <span>Nemli (55 - 75%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0d9488' }}></div>
                  <span>Orta Nem (35 - 55%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ca8a04' }}></div>
                  <span>Kuru (&lt;35%)</span>
                </div>
              </div>
            )}

            {activeLayer === 'airisk' && (
              <div className="glass-panel" style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '0.8rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--outline)' }}>
                <strong style={{ color: 'var(--primary)' }}>ğŸ¤– AI YangÄ±n Riski</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }}></div>
                  <span>AÅŸÄ±rÄ± Risk (&gt;80%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ea580c' }}></div>
                  <span>YÃ¼ksek Risk (60 - 80%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
                  <span>Orta Risk (40 - 60%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
                  <span>DÃ¼ÅŸÃ¼k Risk (20 - 40%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                  <span>GÃ¼venli (&lt;20%)</span>
                </div>
              </div>
            )}
            
            {/* Custom Map Mode Controls (Floating on Map) */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: '1px solid var(--outline)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                {activeLayer === 'default' ? t('dashboard.map_normal') : 
                 activeLayer === 'temp' ? t('dashboard.map_heat') : 
                 activeLayer === 'rain' ? t('dashboard.map_rain') : 
                 activeLayer === 'wind' ? t('dashboard.map_wind') : 
                 activeLayer === 'humidity' ? 'Nem' :
                 'Yapay Zeka Risk'}
              </button>
              
              {isLayerMenuOpen && (
                <div className="glass-panel" style={{
                  position: 'absolute', bottom: '120%', left: 0, minWidth: '150px',
                  display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem',
                  animation: 'fadeIn 0.2s ease', transformOrigin: 'bottom left',
                  zIndex: 1000
                }}>
                  <button onClick={() => { setActiveLayer('default'); setIsLayerMenuOpen(false); }} style={{ background: 'transparent', color: activeLayer === 'default' ? 'var(--primary)' : 'var(--text-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <MapIcon size={16} /> {t('dashboard.map_normal')}
                  </button>
                  <button onClick={() => { setActiveLayer('temp'); setIsLayerMenuOpen(false); }} style={{ background: 'transparent', color: activeLayer === 'temp' ? 'var(--primary)' : 'var(--text-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <Thermometer size={16} /> {t('dashboard.map_heat')}
                  </button>
                  <button onClick={() => { setActiveLayer('rain'); setIsLayerMenuOpen(false); }} style={{ background: 'transparent', color: activeLayer === 'rain' ? 'var(--primary)' : 'var(--text-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <CloudRain size={16} /> {t('dashboard.map_rain')}
                  </button>
                  <button onClick={() => { setActiveLayer('wind'); setIsLayerMenuOpen(false); }} style={{ background: 'transparent', color: activeLayer === 'wind' ? 'var(--primary)' : 'var(--text-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <Wind size={16} /> {t('dashboard.map_wind')}
                  </button>
                  <button onClick={() => { setActiveLayer('humidity'); setIsLayerMenuOpen(false); }} style={{ background: 'transparent', color: activeLayer === 'humidity' ? 'var(--primary)' : 'var(--text-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <Droplets size={16} /> Nem
                  </button>
                  <button onClick={() => { setActiveLayer('airisk'); setIsLayerMenuOpen(false); }} style={{ background: 'transparent', color: activeLayer === 'airisk' ? 'var(--primary)' : 'var(--text-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <Activity size={16} /> Yapay Zeka Risk
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Camera Feeds (Col Span 3) */}
          <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontSize: '0.9rem' }}>
                  <Eye size={16} color="var(--primary)" /> {t('dashboard.camera_feeds')}
                </h3>
                <button 
                  onClick={() => setIsAddCameraModalOpen(true)}
                  style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  + Add
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
                
                {cameras.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    <p>{t('dashboard.no_cameras')}</p>
                    <p style={{ fontSize: '0.9rem' }}>{t('dashboard.click_add')}</p>
                  </div>
                ) : (
                  cameras.map((cam) => (
                    <div key={cam.id} style={{ background: 'var(--surface-variant)', borderRadius: '8px', overflow: 'hidden', border: cam.status === 'fire' ? '1px solid var(--error)' : cam.status === 'smoke' ? '1px solid orange' : '1px solid var(--outline)', position: 'relative' }}>
                    
                    {/* Render Image or iframe depending on URL */}
                    {cam.url.includes('youtube.com') || cam.url.includes('vimeo.com') || cam.url.includes('youtu.be') || cam.aiScore === 'Web Page' ? (
                      <iframe src={getEmbedUrl(cam.url)} style={{ width: '100%', height: '120px', border: 'none' }} title={cam.name} />
                    ) : (
                      brokenImages[cam.id] ? (
                        <div style={{ width: '100%', height: '120px', background: 'var(--surface-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem', fontSize: '0.8rem' }}>
                          <AlertTriangle size={24} color="var(--error)" />
                          <span>{t('dashboard.cam_offline', 'Kamera Ã‡evrimdÄ±ÅŸÄ±')}</span>
                        </div>
                      ) : (
                        <img 
                          src={cam.url} 
                          alt={cam.name} 
                          onError={() => setBrokenImages(prev => ({ ...prev, [cam.id]: true }))}
                          style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} 
                        />
                      )
                    )}

                    <div style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <span>{cam.name} ({cam.region})</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: cam.status === 'fire' ? 'var(--error)' : cam.status === 'smoke' ? 'orange' : 'var(--primary)', fontWeight: 600 }}>
                          {cam.aiScore === 'Analyzing...' ? t('dashboard.analyzing') : 
                           cam.aiScore === 'Web Page' ? 'Web Feed' : 
                           cam.aiScore}
                        </span>
                        <button onClick={() => removeCamera(cam.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>Ã—</button>
                      </div>
                    </div>
                  </div>
                ))
                )}
                
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add Camera Modal */}
      {isAddCameraModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye color="var(--primary)" /> {t('dashboard.add_public')}
            </h2>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('dashboard.cam_name')}</label>
              <input 
                type="text" 
                value={newCamera.name}
                onChange={e => setNewCamera({...newCamera, name: e.target.value})}
                placeholder="e.g. MOBESE-Kemer-01" 
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--outline)', color: 'var(--text-color)', padding: '0.8rem', borderRadius: '4px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('dashboard.region')}</label>
              <input 
                type="text" 
                value={newCamera.region}
                onChange={e => setNewCamera({...newCamera, region: e.target.value})}
                placeholder="e.g. Antalya" 
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--outline)', color: 'var(--text-color)', padding: '0.8rem', borderRadius: '4px' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('dashboard.stream_url')}</label>
              <input 
                type="text" 
                value={newCamera.url}
                onChange={e => setNewCamera({...newCamera, url: e.target.value})}
                placeholder="Ã–rn: https://www.youtube.com/watch?v=hLDdZ8144p4" 
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--outline)', color: 'var(--text-color)', padding: '0.8rem', borderRadius: '4px' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setIsAddCameraModalOpen(false)} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid var(--outline)', color: 'var(--text-color)', borderRadius: '4px', cursor: 'pointer' }}>
                {t('dashboard.cancel')}
              </button>
              <button onClick={handleAddCamera} style={{ padding: '0.8rem 1.5rem', background: 'var(--primary)', border: 'none', color: 'var(--on-primary)', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {t('dashboard.add_camera')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

