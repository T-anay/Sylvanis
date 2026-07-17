import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Satellite, Shield, Cpu } from 'lucide-react';

export const AboutUsPage = () => {
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-color)', letterSpacing: '-1px' }}>
            {t('nav.about_us')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
            {t('about.mission_desc')}
          </p>
        </div>

        {/* Mission Grid */}
        <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
          
          <div className="glass-panel" style={{ gridColumn: 'span 8', padding: '3rem', borderLeft: '4px solid var(--primary)' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield color="var(--primary)" size={32} /> {t('about.mission')}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              {t('about.mission_desc')}
            </p>
          </div>

          <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
             <Satellite size={64} color="var(--text-color)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
             <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('about.global_coverage')}</h3>
             <p style={{ color: 'var(--text-muted)' }}>{t('about.global_desc')}</p>
          </div>

        </div>

        {/* Core Tech */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem' }}>{t('about.technology')}</h2>
          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <Cpu size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('about.edge_ai')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('about.edge_desc')}</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <Satellite size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('about.firms')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('about.firms_desc')}</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <Users size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{t('about.community')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('about.community_desc')}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
