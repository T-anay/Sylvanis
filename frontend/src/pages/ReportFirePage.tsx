import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { MapPin, AlertTriangle, UploadCloud, X, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Fix Leaflet Default Icon Issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and move marker
function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export const ReportFirePage = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(null);
  
  // Form State
  const [intensity, setIntensity] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [context, setContext] = useState('');
  const [reporter, setReporter] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Custom Alert State
  const [customAlert, setCustomAlert] = useState<{show: boolean, message: string, type: 'error' | 'success'}>({ show: false, message: '', type: 'error' });

  const showAlert = (message: string, type: 'error' | 'success' = 'error') => {
    setCustomAlert({ show: true, message, type });
    setTimeout(() => setCustomAlert({ show: false, message: '', type: 'error' }), 4000);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latlng = new L.LatLng(position.coords.latitude, position.coords.longitude);
        setSelectedLocation(latlng);
        showAlert("Location acquired successfully!", "success");
      }, () => {
        showAlert("Geolocation access denied or unavailable.");
      });
    } else {
      showAlert("Geolocation is not supported by this browser.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      showAlert(t('report.pick_location'));
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("latitude", selectedLocation.lat.toString());
    formData.append("longitude", selectedLocation.lng.toString());
    formData.append("intensity", intensity);
    formData.append("additionalContext", context);
    formData.append("reporterName", reporter);
    formData.append("contactNumber", contact);
    if (imageFile) {
      formData.append("file", imageFile);
    }

    try {
      const response = await fetch('http://localhost:8080/api/incidents', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        showAlert("İhbar başarıyla gönderildi! Haritaya yönlendiriliyorsunuz...", "success");
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        showAlert("İhbar gönderilemedi. Lütfen tekrar deneyin.");
      }
    } catch (e) {
      console.error(e);
      showAlert("Sunucu bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-form" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', display: 'flex', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div style={{ maxWidth: '1000px', width: '100%', padding: '0 1rem' }}>
        
        {/* Başlık Bölümü */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-color)' }}>
            {t('report.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            {t('report.desc')}
          </p>
          
          {/* Uyarı Kutusu */}
          <div style={{ 
            marginTop: '2rem', 
            background: 'var(--error-container)', 
            borderLeft: '4px solid var(--error)', 
            padding: '1rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            textAlign: 'left'
          }}>
            <AlertTriangle color="var(--error)" size={24} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, color: 'var(--on-error-container)', fontWeight: 500 }}>
              {t('report.warning')}
            </p>
          </div>
        </div>

        {/* Ana İçerik Grid */}
        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Sol Sütun */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Incident Location */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.2rem' }}>
                  <MapPin color="var(--primary)" /> {t('report.location')}
                </h2>
                <span style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{t('report.required')}</span>
              </div>
              
              <div 
                onClick={() => setIsMapModalOpen(true)}
                style={{ 
                  width: '100%', height: '200px', background: 'var(--surface-variant)', 
                  borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--outline)'
                }}
              >
                {selectedLocation ? (
                   <div style={{ textAlign: 'center' }}>
                     <MapPin color="var(--primary)" size={48} style={{ marginBottom: '1rem' }} />
                     <p style={{ fontWeight: 600 }}>{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
                     <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{t('report.confirm_location')}</p>
                   </div>
                ) : (
                  <>
                    <MapPin color="var(--primary)" size={48} style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>{t('report.pick_location')}</p>
                  </>
                )}
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
                <UploadCloud color="var(--primary)" /> {t('report.evidence_upload')}
              </h2>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />

              <div 
                onClick={triggerFileInput}
                style={{ 
                  border: '2px dashed var(--outline)', 
                  borderRadius: '8px', 
                  padding: imagePreview ? '1rem' : '3rem', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--surface-variant)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }} onClick={e => e.stopPropagation()}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxHeight: '140px', borderRadius: '4px', display: 'block', margin: '0 auto' }} 
                    />
                    <button 
                      onClick={removeSelectedImage}
                      style={{ 
                        position: 'absolute', top: -10, right: -10, 
                        background: 'var(--error)', color: '#fff', 
                        border: 'none', borderRadius: '50%', 
                        width: '24px', height: '24px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('report.drag_drop')}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('report.browse_files')}</p>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Sağ Sütun */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Fire Details */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.2rem' }}>
                  <AlertTriangle color="var(--error)" /> {t('report.fire_details')}
                </h2>
                <span style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{t('report.required')}</span>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('report.intensity')}</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="button"
                    onClick={() => setIntensity('Small')}
                    style={{ 
                      flex: 1, padding: '0.8rem', 
                      background: intensity === 'Small' ? 'var(--primary-container)' : 'var(--surface)', 
                      border: intensity === 'Small' ? '1px solid var(--primary)' : '1px solid var(--outline)', 
                      color: intensity === 'Small' ? 'var(--on-primary-container)' : 'var(--text-color)', 
                      borderRadius: '4px', cursor: 'pointer', fontWeight: intensity === 'Small' ? 'bold' : 'normal' 
                    }}
                  >
                    {t('report.small')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIntensity('Medium')}
                    style={{ 
                      flex: 1, padding: '0.8rem', 
                      background: intensity === 'Medium' ? 'orange' : 'var(--surface)', 
                      border: intensity === 'Medium' ? '1px solid darkorange' : '1px solid var(--outline)', 
                      color: intensity === 'Medium' ? '#fff' : 'var(--text-color)', 
                      borderRadius: '4px', cursor: 'pointer', fontWeight: intensity === 'Medium' ? 'bold' : 'normal' 
                    }}
                  >
                    {t('report.medium')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIntensity('Large')}
                    style={{ 
                      flex: 1, padding: '0.8rem', 
                      background: intensity === 'Large' ? 'var(--error-container)' : 'var(--surface)', 
                      border: intensity === 'Large' ? '1px solid var(--error)' : '1px solid var(--outline)', 
                      color: intensity === 'Large' ? 'var(--on-error-container)' : 'var(--text-color)', 
                      borderRadius: '4px', cursor: 'pointer', fontWeight: intensity === 'Large' ? 'bold' : 'normal' 
                    }}
                  >
                    {t('report.large')}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('report.context')}</label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('report.optional')}</span>
                </div>
                <textarea 
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder={t('report.context_placeholder')}
                  style={{ 
                    width: '100%', 
                    height: '120px', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--outline)', 
                    color: 'var(--text-color)',
                    padding: '1rem',
                    borderRadius: '4px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                ></textarea>
              </div>
            </div>

            {/* Reporter Identity */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
               <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', fontSize: '1.2rem' }}>
                <UploadCloud color="var(--text-muted)" /> {t('report.reporter')}
              </h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('report.full_name')}</label>
                <input 
                  type="text" 
                  value={reporter}
                  onChange={e => setReporter(e.target.value)}
                  placeholder="John Doe" 
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--outline)', color: 'var(--text-color)', padding: '0.5rem 0', fontSize: '1rem', outline: 'none' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('report.contact_number')}</label>
                <input 
                  type="text" 
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="+90 (555) 000-0000" 
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--outline)', color: 'var(--text-color)', padding: '0.5rem 0', fontSize: '1rem', outline: 'none' }} 
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ 
                width: '100%', 
                padding: '1.2rem', 
                background: isSubmitting ? 'var(--outline)' : 'var(--primary)', 
                color: 'var(--on-primary)', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: 'auto'
              }}
            >
              {isSubmitting ? "Gönderiliyor..." : t('report.submit')}
            </button>
          </div>

        </div>
      </div>

      {/* Map Modal */}
      {isMapModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin /> Pick Location</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleUseCurrentLocation} style={{ background: 'var(--surface-variant)', color: 'var(--text-color)', border: '1px solid var(--outline)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Crosshair size={16} /> {t('report.use_current_location')}
                </button>
                <button onClick={() => setIsMapModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
               <MapContainer 
                 center={[39.0, 35.0]} 
                 zoom={6} 
                 minZoom={3}
                 maxBounds={[[-90, -180], [90, 180]]}
                 maxBoundsViscosity={1.0}
                 style={{ height: '100%', width: '100%' }}
               >
                  <TileLayer 
                    noWrap={true}
                    url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
                  />
                  <LocationMarker position={selectedLocation} setPosition={setSelectedLocation} />
               </MapContainer>
               <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '20px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
                 {t('report.drag_map_instruction')}
               </div>
            </div>
            {selectedLocation && (
              <div style={{ padding: '1rem', borderTop: '1px solid var(--outline)', display: 'flex', justifyContent: 'flex-end' }}>
                 <button onClick={() => setIsMapModalOpen(false)} style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                   {t('report.confirm_location')}
                 </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Toast Alert */}
      {customAlert.show && (
        <div style={{ 
          position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', 
          background: customAlert.type === 'error' ? 'var(--error-container)' : 'var(--primary-container)', 
          color: customAlert.type === 'error' ? 'var(--on-error-container)' : 'var(--on-primary)', 
          padding: '1rem 2rem', borderRadius: '8px', zIndex: 10000, 
          display: 'flex', alignItems: 'center', gap: '1rem', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontWeight: 600,
          animation: 'fadeInDown 0.3s ease' 
        }}>
          <AlertTriangle size={20} />
          {customAlert.message}
          <button onClick={() => setCustomAlert({ ...customAlert, show: false })} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '1rem' }}>
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
};
