import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { Map, AlertTriangle, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 40;
const FRAME_PREFIX = '/fire_sequence/ezgif-frame-';
const FRAME_EXT = '.jpg';

export const ScrollImageSequence = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `${FRAME_PREFIX}${paddedIndex}${FRAME_EXT}`;
      
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (imagesLoaded < FRAME_COUNT || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (index: number) => {
      const img = images[index];
      if (!img) return;
      
      // Resim kalitesini artırmak için yumuşatma (smoothing) ayarları
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      const canvasRatio = window.innerWidth / window.innerHeight;
      const imgRatio = img.width / img.height;
      
      let drawWidth = window.innerWidth;
      let drawHeight = window.innerHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = window.innerHeight * imgRatio;
        offsetX = (window.innerWidth - drawWidth) / 2;
      } else {
        drawHeight = window.innerWidth / imgRatio;
        offsetY = (window.innerHeight - drawHeight) / 2;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      ctx.scale(dpr, dpr);

      const progress = ScrollTrigger.getById('seq-trigger')?.progress || 0;
      const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
      render(frameIndex);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const obj = { frame: 0 };
    
    ScrollTrigger.create({
      id: 'seq-trigger',
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
        
        if (obj.frame !== frameIndex) {
          obj.frame = frameIndex;
          requestAnimationFrame(() => render(frameIndex));
        }

        // --- Text Overlays Logic (Fade in/out based on scroll progress) ---
        if (text1Ref.current && text2Ref.current && text3Ref.current) {
          // Reset all
          text1Ref.current.style.opacity = '0';
          text2Ref.current.style.opacity = '0';
          text3Ref.current.style.opacity = '0';
          text1Ref.current.style.pointerEvents = 'none';
          text2Ref.current.style.pointerEvents = 'none';
          text3Ref.current.style.pointerEvents = 'none';

          if (progress >= 0 && progress < 0.3) {
            let opacity = 1;
            // İlk yazı ekrana ilk girildiğinde direkt açık olacak (scroll beklenmeyecek)
            if (progress > 0.2) opacity = 1 - ((progress - 0.2) / 0.1);
            text1Ref.current.style.opacity = Math.max(0, opacity).toString();
          } else if (progress >= 0.3 && progress < 0.6) {
            let opacity = 1;
            if (progress < 0.35) opacity = (progress - 0.3) / 0.05;
            if (progress > 0.55) opacity = 1 - ((progress - 0.55) / 0.05);
            text2Ref.current.style.opacity = Math.max(0, opacity).toString();
          } else if (progress >= 0.6) {
            let opacity = 1;
            if (progress < 0.65) opacity = (progress - 0.6) / 0.05;
            text3Ref.current.style.opacity = Math.max(0, opacity).toString();
            text3Ref.current.style.pointerEvents = 'auto';
          }
          
          // Scroll Indicator fade out
          if (scrollIndicatorRef.current) {
             if (progress > 0.02) {
               scrollIndicatorRef.current.style.opacity = '0';
             } else {
               scrollIndicatorRef.current.style.opacity = '0.7';
             }
          }
        }
      }
    });

    render(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getById('seq-trigger')?.kill();
    };
  }, [imagesLoaded, images]);

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 20,
    textAlign: 'center',
    opacity: 0,
    transition: 'opacity 0.1s ease',
    width: '100%',
    padding: '0 2rem'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '4rem',
    fontWeight: 800,
    letterSpacing: '-2px',
    marginBottom: '1rem',
    textShadow: '0 4px 20px rgba(0,0,0,0.8)'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
    lineHeight: 1.6
  };

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-color)' }}>
        
        {/* Loading Indicator */}
        {imagesLoaded < FRAME_COUNT && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, color: 'var(--text-color)', fontWeight: 'bold' }}>
            Loading Visual Engine... {Math.round((imagesLoaded / FRAME_COUNT) * 100)}%
          </div>
        )}

        {/* Canvas */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'block', width: '100%', height: '100%', opacity: imagesLoaded === FRAME_COUNT ? 1 : 0, transition: 'opacity 0.5s', objectFit: 'cover' }}
        />
        
        {/* Dark Gradient Overlay for readability (Always dark so white text pops) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(15,23,42,0.8) 0%, transparent 20%, transparent 70%, rgba(15,23,42,0.8) 100%)', pointerEvents: 'none', zIndex: 15 }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 15 }}></div>

        {/* --- Scroll Text Overlays (Hardcoded to White for contrast over images) --- */}
        <div ref={text1Ref} style={{ ...overlayStyle, opacity: 1 }}>
          <h1 className="hero-title" style={{ ...titleStyle, color: '#ffffff' }}>{t('home.hero_title_1', 'SYLVANIS SYSTEM')}</h1>
          <p style={{ ...subtitleStyle, color: '#cbd5e1' }}>{t('home.hero_subtitle_1', 'Real-time fire detection for critical ecosystems.')}</p>
        </div>

        <div ref={text2Ref} style={overlayStyle}>
          <h1 className="hero-title" style={{ ...titleStyle, color: 'var(--primary)' }}>{t('home.hero_title_2', 'AI Powered Detection')}</h1>
          <p style={{ ...subtitleStyle, color: '#cbd5e1' }}>{t('home.hero_subtitle_2', 'Advanced computer vision identifying threats before they spread.')}</p>
        </div>

        <div ref={text3Ref} style={overlayStyle}>
          <h1 className="hero-title" style={{ ...titleStyle, color: '#ffffff' }}>{t('home.hero_title_3', 'NASA Satellite Intelligence')}</h1>
          <p style={{ ...subtitleStyle, color: '#cbd5e1' }}>{t('home.hero_subtitle_3', 'Global coverage from space to ground, down to the minute.')}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '16px 32px', fontSize: '1.1rem' }}>
              <Map size={20} /> {t('home.go_to_map', 'Go to Map')}
            </button>
            <button onClick={() => navigate('/report')} style={{ 
              background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.2)', 
              color: '#ffffff', padding: '16px 32px', borderRadius: '8px', 
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '1.1rem', transition: 'all 0.2s', backdropFilter: 'blur(10px)'
            }}>
              <AlertTriangle size={20} color="#f87171" /> {t('home.report_fire', 'Report a Fire')}
            </button>
          </div>
        </div>

        {/* --- SCROLL INDICATOR --- */}
        <div ref={scrollIndicatorRef} style={{
          position: 'absolute', bottom: '2rem', left: '0', width: '100%',
          display: 'flex', justifyContent: 'center',
          zIndex: 20, opacity: 0.7, transition: 'opacity 0.3s ease', pointerEvents: 'none'
        }}>
          <div className="animate-bounce" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#cbd5e1' }}>{t('home.scroll_to_detect', 'Scroll to detect')}</span>
            <ChevronDown size={32} color="var(--primary)" />
          </div>
        </div>

      </div>
    </div>
  );
};
