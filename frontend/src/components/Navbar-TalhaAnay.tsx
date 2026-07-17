import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(() => sessionStorage.getItem('sylvanis_admin_auth') === 'true');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // AdminPage'den giriş/çıkış yapılınca butonu güncelle
  useEffect(() => {
    const onAuthChange = () => setIsAdminAuth(sessionStorage.getItem('sylvanis_admin_auth') === 'true');
    window.addEventListener('adminAuthChange', onAuthChange);
    return () => window.removeEventListener('adminAuthChange', onAuthChange);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangOpen(false);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = theme === 'dark';

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    padding: '1.5rem 3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
    // Hafif arka plan blur (Glassmorphism)
    background: isDark ? 'rgba(11, 15, 25, 0.8)' : 'rgba(248, 250, 252, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--primary)',
    letterSpacing: '-1px',
    margin: 0
  };

  const linksContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2.5rem',
    alignItems: 'center'
  };

  const linkStyle = (path: string): React.CSSProperties => ({
    color: location.pathname === path ? 'var(--primary)' : 'var(--text-color)',
    fontWeight: location.pathname === path ? 600 : 400,
    borderBottom: location.pathname === path ? '2px solid var(--primary)' : '2px solid transparent',
    paddingBottom: '4px',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  });

  const isAdminPage = location.pathname === '/admin';

  const handleAdminLogout = () => {
    sessionStorage.removeItem('sylvanis_admin_auth');
    setIsAdminAuth(false);
    navigate('/');
  };

  return (
    <nav style={navStyle}>
      {/* Sol Taraf: Logo */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={logoStyle}>SYLVANIS</h1>
      </Link>

      {/* Orta Taraf: Linkler (Mobil için gizli) */}
      <div className="nav-links" style={linksContainerStyle}>
        <Link to="/" style={linkStyle('/')}>{t('nav.home')}</Link>
        <Link to="/report" style={linkStyle('/report')}>{t('nav.report_fire')}</Link>
        <Link to="/dashboard" style={linkStyle('/dashboard')}>{t('nav.monitoring_map')}</Link>
        <Link to="/about" style={linkStyle('/about')}>{t('nav.about_us')}</Link>

        {/* Admin Dashboard sekmesi — sadece giriş yapıldıysa */}
        {isAdminAuth && (
          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: isAdminPage ? '#fff' : '#16a34a',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              background: isAdminPage
                ? 'linear-gradient(135deg, #16a34a, #15803d)'
                : 'rgba(22,163,74,0.1)',
              border: '1px solid rgba(22,163,74,0.35)',
              padding: '5px 14px',
              borderRadius: '20px',
              letterSpacing: '0.3px',
              transition: 'all 0.2s ease',
              boxShadow: isAdminPage ? '0 2px 10px rgba(22,163,74,0.4)' : 'none',
            }}
            onMouseEnter={e => {
              if (!isAdminPage) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(22,163,74,0.4)';
              }
            }}
            onMouseLeave={e => {
              if (!isAdminPage) {
                e.currentTarget.style.background = 'rgba(22,163,74,0.1)';
                e.currentTarget.style.color = '#16a34a';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* Sağ Taraf: Tema & Dil & Admin */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>

        {/* Custom Language Switcher */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--outline)',
              color: 'var(--text-color)', outline: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, padding: '0.4rem 0.8rem', borderRadius: '20px',
              transition: 'all 0.2s ease'
            }}
          >
            <Globe size={16} color="var(--primary)" />
            {i18n.language.substring(0, 2).toUpperCase()}
            <ChevronDown size={14} style={{ transform: isLangOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          {isLangOpen && (
            <div className="glass-panel" style={{
              position: 'absolute', top: '120%', right: 0, minWidth: '120px',
              padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem',
              zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              transformOrigin: 'top right', animation: 'fadeIn 0.2s ease'
            }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'tr', label: 'Türkçe' },
                { code: 'de', label: 'Deutsch' },
                { code: 'fr', label: 'Français' },
                { code: 'es', label: 'Español' },
                { code: 'ar', label: 'العربية' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  style={{
                    background: i18n.language.startsWith(lang.code) ? 'var(--primary)' : 'transparent',
                    color: i18n.language.startsWith(lang.code) ? 'var(--on-primary)' : 'var(--text-color)',
                    border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', textAlign: 'left',
                    cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!i18n.language.startsWith(lang.code)) e.currentTarget.style.background = 'var(--surface-variant)';
                  }}
                  onMouseOut={(e) => {
                    if (!i18n.language.startsWith(lang.code)) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Admin / Logout Butonu */}
        {isAdminAuth ? (
          <button
            onClick={handleAdminLogout}
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: '2px solid #ef4444',
              padding: '8px 22px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
          >
            {t('admin.logout')}
          </button>
        ) : (
          <Link
            to="/admin"
            onClick={() => setIsAdminAuth(sessionStorage.getItem('sylvanis_admin_auth') === 'true')}
            style={{
              backgroundColor: isAdminPage ? 'var(--primary)' : 'transparent',
              color: isAdminPage ? 'var(--on-primary)' : 'var(--primary)',
              border: '2px solid var(--primary)',
              padding: '8px 22px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (!isAdminPage) {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--on-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAdminPage) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--primary)';
              }
            }}
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
};
