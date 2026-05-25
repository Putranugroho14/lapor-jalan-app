import React, { useState, useEffect } from 'react';
import { Sliders, Check, Info, RefreshCw, X, HelpCircle, EyeOff } from 'lucide-react';
import { getABVariant, setABVariant } from '../utils/abTesting';
import { colors, borderRadius, shadows, transitions } from '../designSystem';
import { useAlert } from './AlertContext';

function ABTestingControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [variant, setVariant] = useState(getABVariant());
  const [isHidden, setIsHidden] = useState(() => localStorage.getItem('ab_control_hidden') === 'true');
  const token = localStorage.getItem('token');
  const { showAlert } = useAlert();

  useEffect(() => {
    const handleChanged = () => {
      setVariant(getABVariant());
    };
    window.addEventListener('ab-variant-changed', handleChanged);
    return () => window.removeEventListener('ab-variant-changed', handleChanged);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle visibility with Ctrl + Shift + A or Ctrl + Alt + B
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') ||
        (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'b')
      ) {
        e.preventDefault();
        setIsHidden((prev) => {
          const next = !prev;
          localStorage.setItem('ab_control_hidden', next ? 'true' : 'false');
          if (next) {
            showAlert("A/B Testing Control disembunyikan. Tekan Ctrl + Shift + A untuk memunculkan kembali.", "info");
          } else {
            showAlert("A/B Testing Control ditampilkan kembali.", "success");
          }
          return next;
        });
      }
    };

    // Easter egg untuk HP: Ketuk logo/pojok kiri atas layar 5 kali secara cepat
    let lastTap = 0;
    let tapCount = 0;
    const handleGlobalClick = (e) => {
      // Area logo: pojok kiri atas (lebar 200px, tinggi 80px)
      const isLogoArea = e.clientX < 200 && e.clientY < 80;
      if (isLogoArea) {
        const now = Date.now();
        if (now - lastTap < 400) {
          tapCount++;
          if (tapCount >= 5) {
            setIsHidden((prev) => {
              const next = !prev;
              localStorage.setItem('ab_control_hidden', next ? 'true' : 'false');
              if (next) {
                showAlert("A/B Testing Control disembunyikan.", "info");
              } else {
                showAlert("A/B Testing Control ditampilkan kembali.", "success");
              }
              return next;
            });
            tapCount = 0;
          }
        } else {
          tapCount = 1;
        }
        lastTap = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [showAlert]);

  const handleHide = () => {
    setIsHidden(true);
    localStorage.setItem('ab_control_hidden', 'true');
    setIsOpen(false);
    showAlert("A/B Testing Control disembunyikan. Tekan Ctrl + Shift + A untuk memunculkan kembali.", "info");
  };

  // Only show A/B control panel if user is logged in
  if (!token) return null;

  if (isHidden) return null;

  const handleToggle = (v) => {
    setABVariant(v);
  };

  const containerStyle = {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: 9999,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const buttonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(30, 30, 30, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
  };

  const panelStyle = {
    position: 'absolute',
    bottom: '64px',
    left: 0,
    width: '320px',
    background: 'rgba(20, 20, 20, 0.85)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    color: '#fff',
    display: isOpen ? 'block' : 'none',
    animation: isOpen ? 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: variant === 'A' ? '#ff3b30' : '#34c759',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '800',
    borderRadius: '10px',
    padding: '2px 6px',
    border: '2px solid #1a1a1a',
  };

  const optionCardStyle = (isActive) => ({
    padding: '14px 16px',
    borderRadius: '16px',
    border: isActive ? '1px solid rgba(0,122,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
    background: isActive ? 'rgba(0,122,255,0.12)' : 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Floating Gear Button */}
      <button 
        style={{
          ...buttonStyle,
          transform: isOpen ? 'rotate(90deg)' : 'none',
          background: isOpen ? '#007AFF' : 'rgba(30, 30, 30, 0.75)',
          borderColor: isOpen ? 'rgba(0,122,255,0.4)' : 'rgba(255, 255, 255, 0.15)'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Panel A/B Testing"
      >
        <Sliders size={20} />
        <span style={badgeStyle}>{variant}</span>
      </button>

      {/* Control Panel Popover */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#007AFF" />
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px' }}>A/B Testing Control</h4>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handleHide}
              title="Sembunyikan Panel (Tekan Ctrl + Shift + A untuk memunculkan kembali)"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <EyeOff size={16} />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', lineHeight: '1.4' }}>
          Gunakan panel ini untuk mengganti varian secara dinamis dan menguji antarmuka aplikasi.
        </p>

        {/* Variant A Card */}
        <div style={optionCardStyle(variant === 'A')} onClick={() => handleToggle('A')}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: variant === 'A' ? '#007AFF' : '#fff' }}>Varian A (Control)</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
              Navbar Lapor, Form Panjang, Tabel Teks
            </div>
          </div>
          {variant === 'A' && <Check size={16} color="#007AFF" strokeWidth={3} />}
        </div>

        {/* Variant B Card */}
        <div style={optionCardStyle(variant === 'B')} onClick={() => handleToggle('B')}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: variant === 'B' ? '#34c759' : '#fff' }}>Varian B (Challenger)</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
              FAB Peta, Form Multi-Step, Timeline
            </div>
          </div>
          {variant === 'B' && <Check size={16} color="#34c759" strokeWidth={3} />}
        </div>

        {/* Info Box */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          padding: '10px 12px', 
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <Info size={14} color="#007AFF" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
            <span style={{ fontWeight: '600', color: '#fff' }}>Metrik Pengukuran:</span>
            <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
              <li>UC1: Time to First Click (Navbar vs FAB Peta)</li>
              <li>UC2: Time to Submit & SMEQ (Form Panjang vs 3-Step)</li>
              <li>UC3: Likert Status (Tabel Teks vs Timeline)</li>
            </ul>
          </div>
        </div>

        {/* Hide Switcher Button */}
        <button
          onClick={handleHide}
          style={{
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          <EyeOff size={14} /> Sembunyikan Switcher (Ctrl+Shift+A)
        </button>
      </div>
    </div>
  );
}

export default ABTestingControl;
