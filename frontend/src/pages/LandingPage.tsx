import React from 'react';
import { useTranslation } from 'react-i18next';
import { Satellite, Brain, Users, AlertTriangle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollImageSequence } from '../components/ScrollImageSequence';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ position: 'relative', width: '100vw', background: 'var(--bg-color)' }}>
      
      {/* Scroll Triggered Image Sequence (Hero Area) */}
      <ScrollImageSequence />

      {/* --- DETECTION CORE (BENTO GRID) --- */}
      <section style={{ 
        maxWidth: '1280px', margin: '0 auto', padding: '6rem 2rem', 
        position: 'relative', zIndex: 20, background: 'var(--bg-color)' 
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.5rem' }}>{t('landing.detection_core')}</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{t('landing.detection_desc')}</p>
        </div>

        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          <div className="glass-panel hero-title" style={{ gridColumn: 'span 2', padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-color)' }}>
              {t('landing.title_2')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '80%' }}>
              {t('landing.desc_2')}
            </p>
            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Camera size={20} /> {t('landing.go_to_map')}
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Satellite size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('landing.title_3')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('landing.desc_3')}</p>
          </div>
          
        </div>

        <div className="bento-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: '1.5rem', 
          gridAutoRows: '250px' 
        }}>
          
          {/* AI Analysis (Span 4) */}
          <div style={{ 
            gridColumn: 'span 4', background: 'var(--surface-container)', padding: '2rem', 
            borderRadius: '16px', border: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
          }}>
             <Brain size={200} color="var(--text-color)" style={{ position: 'absolute', right: '-40px', top: '-40px', opacity: 0.05 }} />
             <div style={{ background: 'var(--surface)', padding: '0.8rem', borderRadius: '8px', width: 'fit-content', marginBottom: '1rem', border: '1px solid var(--outline-variant)', zIndex: 10 }}>
                <Brain size={32} color="var(--secondary)" />
              </div>
              <div style={{ marginTop: 'auto', zIndex: 10 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('landing.ai_analysis')}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('landing.ai_desc')}</p>
              </div>
          </div>

          {/* Citizen Reports (Span 4) */}
          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--error-container)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/report')}>
             <AlertTriangle size={48} color="var(--on-error-container)" style={{ marginBottom: '1rem' }} />
             <h3 style={{ color: 'var(--on-error-container)', fontSize: '1.2rem', fontWeight: 700 }}>{t('landing.report_a_fire')}</h3>
          </div>

          {/* Stats Preview (Span 4) */}
          <div className="glass-panel stats-container" style={{ 
            gridColumn: 'span 4', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            borderLeft: '4px solid var(--primary)'
          }}>
             <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
               <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-2px' }}>1,240</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('landing.active_stations')}</div>
             </div>
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-2px' }}>04<span style={{ fontSize: '2rem', color: 'var(--secondary)' }}>m</span></div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('landing.avg_response')}</div>
             </div>
          </div>

        </div>
      </section>

      {/* --- MISSION STATEMENT (ABOUT SECTION) --- */}
      <section style={{ 
        borderTop: '1px solid var(--outline-variant)', 
        background: 'var(--surface-container-low)', 
        padding: '8rem 2rem', 
        position: 'relative', overflow: 'hidden' 
      }}>
        <div style={{ 
          position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(var(--outline) 1px, transparent 1px), linear-gradient(90deg, var(--outline) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
           <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>Mission Statement</span>
           <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-color)' }}>Reducing response time from hours to minutes.</h2>
           <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              SYLVANIS was engineered to bridge the gap between initial ignition and emergency response. By synthesizing vast amounts of satellite telemetry, ground sensor data, and community input through robust AI models, we provide actionable intelligence to first responders faster than ever before.
           </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer-content" style={{
        width: '100%', padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface-container-lowest)', borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-1px' }}>SYLVANIS</span>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Emergency Protocol</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Support</a>
        </div>
        
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 SYLVANIS Fire Detection. All systems operational.</span>
      </footer>

    </div>
  );
};
