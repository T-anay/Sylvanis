import React, { useState, useEffect } from 'react';
import { Shield, Trash2, CheckCircle, Eye, X, Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export const AdminPage = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('sylvanis_admin_auth') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // F5 sonrası oturum devam ediyorsa verileri yükle
  useEffect(() => {
    if (isLoggedIn && incidents.length === 0) {
      fetchIncidents();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'sylvanis2026') {
      const basicAuth = btoa(username + ':' + password);
      sessionStorage.setItem('sylvanis_admin_auth', 'true');
      sessionStorage.setItem('sylvanis_admin_token', basicAuth);
      window.dispatchEvent(new Event('adminAuthChange'));
      setIsLoggedIn(true);
      setLoginError('');
      fetchIncidents();
    } else {
      setLoginError(t('admin.login_error'));
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/incidents');
      if (res.ok) {
        setIncidents(await res.json());
      } else throw new Error();
    } catch {
      setIncidents([
        {
          id: 1, latitude: 36.9, longitude: 28.5, aiConfirmedFire: true,
          aiConfidenceScore: 0.895, aiDetectionLabel: 'fire',
          imagePath: 'https://images.unsplash.com/photo-1602980068822-790100062a42?q=80&w=200',
          reporterName: 'Ahmet Yılmaz', intensity: 'High', reportedAt: new Date().toISOString()
        },
        {
          id: 2, latitude: 37.2, longitude: 30.1, aiConfirmedFire: false,
          aiConfidenceScore: 0.12, aiDetectionLabel: 'clear',
          imagePath: null, reporterName: 'Ayşe K.', intensity: 'Small', reportedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const deleteIncident = async (id: number) => {
    const token = sessionStorage.getItem('sylvanis_admin_token');
    try { await fetch(`http://localhost:8080/api/incidents/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${token}` }
    }); } catch { }
    setIncidents(incidents.filter(inc => inc.id !== id));
  };

  const verifyIncident = async (id: number) => {
    const token = sessionStorage.getItem('sylvanis_admin_token');
    try { await fetch(`http://localhost:8080/api/incidents/${id}/verify?isFire=true`, { 
      method: 'PUT',
      headers: { 'Authorization': `Basic ${token}` }
    }); } catch { }
    setIncidents(incidents.map(inc => inc.id === id ? { ...inc, aiConfirmedFire: true, imagePath: null } : inc));
  };

  const getSeverityLabel = (intensity: string) => {
    if (intensity === 'High' || intensity === 'Large') return t('admin.severity_high');
    if (intensity === 'Medium') return t('admin.severity_medium');
    return t('admin.severity_low');
  };

  // ── LOGIN PAGE ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Background: lush green forest photo (public, free Unsplash) */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.55) saturate(1.2)',
        }} />

        {/* Gradient overlay to match site dark theme */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(11,15,25,0.7) 0%, rgba(5,46,22,0.55) 60%, rgba(11,15,25,0.65) 100%)',
        }} />

        {/* Subtle glow orbs */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', bottom: '-150px', left: '-50px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)', top: '-100px', right: '-50px', pointerEvents: 'none' }} />

        {/* Login card */}
        <form
          className="admin-login-box"
          onSubmit={handleLogin}
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '2.8rem 2.5rem',
            width: '360px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.3rem',
          }}
        >
          {/* Logo + title */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 0 8px rgba(22,163,74,0.12)'
            }}>
              <Shield size={28} color="#fff" />
            </div>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {t('admin.login_title')}
            </h2>
            <p style={{ margin: '0.4rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              {t('admin.login_subtitle')}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 -0.5rem' }} />

          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              {t('admin.username')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 0.9rem', transition: 'border-color 0.2s' }}>
              <User size={15} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={t('admin.username_placeholder')}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.78rem 0.6rem', color: '#f1f5f9', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              {t('admin.password')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 0.9rem' }}>
              <Lock size={15} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.78rem 0.6rem', color: '#f1f5f9', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {/* Error */}
          {loginError && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '0.7rem 1rem', color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(22,163,74,0.35)',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(22,163,74,0.35)'; }}
          >
            {t('admin.login_button')}
          </button>

          {/* Site branding */}
          <p style={{ margin: 0, textAlign: 'center', color: 'rgba(148,163,184,0.5)', fontSize: '0.75rem' }}>
            SYLVANIS — Forest Intelligence System
          </p>
        </form>
      </div>
    );
  }

  // ── ADMIN PANEL ─────────────────────────────────────────────────────────
  const pendingCount = incidents.filter(i => !i.aiConfirmedFire).length;
  const confirmedCount = incidents.filter(i => i.aiConfirmedFire).length;

  const panelBg = isDark
    ? 'linear-gradient(160deg, #0b0f19 0%, #0d2318 50%, #0b0f19 100%)'
    : 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 50%, #fefce8 100%)';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const tableRowHover = isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc';
  const tableHeadBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const textPrimary = isDark ? '#f1f5f9' : '#1e293b';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9';

  return (
    <div style={{ minHeight: '100vh', background: panelBg, paddingTop: '80px' }}>

      {/* Top header strip */}
      <div style={{
        background: isDark
          ? 'rgba(11,15,25,0.95)'
          : 'linear-gradient(135deg, #052e16 0%, #1e3a5f 100%)',
        borderBottom: '1px solid rgba(22,163,74,0.2)',
        padding: '1.2rem 2.5rem',
        display: 'flex', alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px rgba(22,163,74,0.25)' }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{t('admin.panel_title')}</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{t('admin.panel_subtitle')}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem' }}>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: t('admin.total_reports'), value: incidents.length, color: '#3b82f6', glow: 'rgba(59,130,246,0.2)', icon: '' },
            { label: t('admin.pending'), value: pendingCount, color: '#f97316', glow: 'rgba(249,115,22,0.2)', icon: '' },
            { label: t('admin.confirmed_fire'), value: confirmedCount, color: '#ef4444', glow: 'rgba(239,68,68,0.2)', icon: '' }
          ].map(stat => (
            <div key={stat.label} style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '14px',
              padding: '1.3rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
              boxShadow: `0 4px 20px ${stat.glow}`,
              transition: 'transform 0.2s'
            }}>
              <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.82rem', color: textMuted, marginTop: '2px', fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{ background: cardBg, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: `1px solid ${cardBorder}`, overflow: 'hidden' }}>
          <div style={{ padding: '1.2rem 1.8rem', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <h3 style={{ margin: 0, color: textPrimary, fontWeight: 700 }}>{t('admin.queue_title')}</h3>
            {pendingCount > 0 && (
              <span style={{ background: '#f97316', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                {pendingCount} {t('admin.waiting')}
              </span>
            )}
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: tableHeadBg }}>
                  {[
                    t('admin.col_image'), t('admin.col_reporter'), t('admin.col_severity'),
                    t('admin.col_location'), t('admin.col_ai'), t('admin.col_status'), t('admin.col_actions')
                  ].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1.2rem', fontSize: '0.75rem', fontWeight: 700, color: textMuted, letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: `2px solid ${cardBorder}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid ${dividerColor}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = tableRowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Image */}
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      {inc.imagePath ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={inc.imagePath}
                            alt="Kanıt"
                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: '8px', cursor: 'zoom-in', border: `2px solid ${cardBorder}`, display: 'block' }}
                            onClick={() => setSelectedImage(inc.imagePath)}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = `<span style="font-size:0.82rem;color:#94a3b8;background:${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'};padding:4px 10px;border-radius:6px;">⚠️ Yüklenemedi</span>`;
                              }
                            }}
                          />
                          <div onClick={() => setSelectedImage(inc.imagePath)} style={{ position: 'absolute', bottom: 3, right: 3, background: 'rgba(0,0,0,0.55)', padding: '2px', borderRadius: '4px', cursor: 'zoom-in', display: 'flex' }}>
                            <Eye size={11} color="#fff" />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: textMuted, background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>{t('admin.no_photo')}</span>
                      )}
                    </td>

                    {/* Reporter */}
                    <td style={{ padding: '0.9rem 1.2rem', fontWeight: 600, color: textPrimary, fontSize: '0.9rem' }}>{inc.reporterName || 'Anonim'}</td>

                    {/* Severity */}
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      <span style={{
                        background: inc.intensity === 'High' || inc.intensity === 'Large' ? 'rgba(239,68,68,0.1)' : inc.intensity === 'Medium' ? 'rgba(249,115,22,0.1)' : 'rgba(22,163,74,0.1)',
                        color: inc.intensity === 'High' || inc.intensity === 'Large' ? '#ef4444' : inc.intensity === 'Medium' ? '#f97316' : '#16a34a',
                        border: `1px solid ${inc.intensity === 'High' || inc.intensity === 'Large' ? 'rgba(239,68,68,0.3)' : inc.intensity === 'Medium' ? 'rgba(249,115,22,0.3)' : 'rgba(22,163,74,0.3)'}`,
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700
                      }}>
                        {getSeverityLabel(inc.intensity)}
                      </span>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'monospace', fontSize: '0.85rem', color: textMuted }}>
                      {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                    </td>

                    {/* AI Decision */}
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      {inc.aiDetectionLabel ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, color: inc.aiConfirmedFire ? '#ef4444' : '#16a34a', fontSize: '0.88rem' }}>
                            🤖 {inc.aiDetectionLabel.toUpperCase()}
                          </span>
                          {inc.aiConfidenceScore && (
                            <span style={{ fontSize: '0.75rem', color: textMuted }}>
                              {t('admin.ai_confidence')}: {Math.round(inc.aiConfidenceScore * 100)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: textMuted }}>{t('admin.not_analyzed')}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: inc.aiConfirmedFire ? 'rgba(22,163,74,0.1)' : 'rgba(234,179,8,0.1)',
                        color: inc.aiConfirmedFire ? '#16a34a' : '#ca8a04',
                        border: `1px solid ${inc.aiConfirmedFire ? 'rgba(22,163,74,0.3)' : 'rgba(234,179,8,0.3)'}`,
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700
                      }}>
                        {inc.aiConfirmedFire ? `✅ ${t('admin.approved')}` : `⏳ ${t('admin.waiting_status')}`}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!inc.aiConfirmedFire && (
                          <button
                            onClick={() => verifyIncident(inc.id)}
                            style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <CheckCircle size={13} /> {t('admin.approve')}
                          </button>
                        )}
                        <button
                          onClick={() => deleteIncident(inc.id)}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(220,38,38,0.3)', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <Trash2 size={13} /> {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {incidents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: textMuted }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p style={{ margin: 0, fontWeight: 600 }}>{t('admin.empty_queue')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <div style={{ position: 'relative', maxWidth: '80%', maxHeight: '80%' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: -44, right: 0, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '8px', padding: '0.4rem 0.9rem', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <X size={16} /> {t('admin.close')}
            </button>
            <img src={selectedImage} alt="Büyük Görsel" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }} />
          </div>
        </div>
      )}
    </div>
  );
};
