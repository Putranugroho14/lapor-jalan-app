import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  Camera, RotateCcw, FileText, MessageSquare, Send, MapPin,
  CheckCircle, SwitchCamera, ChevronLeft, ChevronRight, Upload, Navigation2
} from 'lucide-react';
import { colors, borderRadius, shadows, transitions, buttons } from '../designSystem';
import config from '../config';
import { useAlert } from './AlertContext';
import { useABVariant } from '../utils/abTesting';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Component to let user click map to set location
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const STEPS = [
  { id: 1, label: 'Lokasi', icon: MapPin },
  { id: 2, label: 'Foto', icon: Camera },
  { id: 3, label: 'Deskripsi', icon: FileText },
];

const DAMAGE_TYPES = [
  "Jalan berlubang", "Retak memanjang", "Retak melebar", "Aspal terkelupas",
  "Jalan amblas", "Jalan bergelombang", "Tergenang air", "Longsor kecil",
  "Marka jalan rusak", "Bahu jalan rusak"
];

const SEVERITY_LEVELS = ["Ringan", "Sedang", "Berat"];

const TRAFFIC_IMPACTS = [
  { value: "Tidak Menghambat", desc: "Jalan masih bisa dilewati normal" },
  { value: "Hambatan Ringan", desc: "Kendaraan melambat, masih bisa dua arah" },
  { value: "Hambatan Sedang", desc: "Sebagian jalan tertutup, antrean pendek" },
  { value: "Hambatan Berat", desc: "Macet parah, jalur tersisa sangat sempit" },
  { value: "Jalan Tertutup Total", desc: "Tidak bisa dilewati sama sekali" }
];

function FormLapor() {
  const variant = useABVariant();
  const [currentStep, setCurrentStep] = useState(1);
  const [coords, setCoords] = useState(null);
  const [manualCoords, setManualCoords] = useState(null);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [useGallery, setUseGallery] = useState(false);
  const [description, setDescription] = useState('');
  const [damageType, setDamageType] = useState('');
  const [damageSeverity, setDamageSeverity] = useState('');
  const [trafficImpact, setTrafficImpact] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState('forward');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const { showAlert } = useAlert();

  // Active location = manual pin override if set, else GPS
  const activeCoords = manualCoords || coords;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => showAlert('Gagal mengambil lokasi GPS. Pastikan izin lokasi aktif.', 'error'),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setImageFile(null);
  }, [webcamRef]);

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const goToStep = (next) => {
    setAnimDir(next > currentStep ? 'forward' : 'back');
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setAnimating(false);
    }, 250);
  };

  const canProceedStep1 = !!activeCoords;
  const canProceedStep2 = !!image;

  const handleSubmit = async () => {
    if (!activeCoords || !image) return showAlert('Foto dan Lokasi wajib ada!', 'error');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', damageType || 'Laporan Kerusakan Jalan');
      formData.append('description', description);
      formData.append('latitude', activeCoords.lat);
      formData.append('longitude', activeCoords.lng);
      formData.append('damageType', damageType);
      formData.append('damageSeverity', damageSeverity);
      formData.append('trafficImpact', trafficImpact);
      formData.append('impactedVehicles', JSON.stringify([]));

      if (imageFile) {
        formData.append('photo', imageFile, imageFile.name);
      } else {
        const blob = await (await fetch(image)).blob();
        formData.append('photo', blob, 'jalan-rusak.jpg');
      }

      const token = localStorage.getItem('token');
      await axios.post(`${config.apiUrl}/api/reports`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      showAlert('Laporan berhasil dikirim! Terima kasih atas kontribusi Anda.', 'success');
      // Reset and redirect
      setCurrentStep(1);
      setImage(null);
      setImageFile(null);
      setManualCoords(null);
      setDescription('');
      setDamageType('');
      setDamageSeverity('');
      setTrafficImpact('');
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      showAlert('Gagal mengirim laporan. ' + (err.response?.data?.message || 'Coba lagi nanti.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Styles ────────────────────────────────────────────────────────────
  const containerStyle = {
    maxWidth: '520px',
    margin: '0 auto',
    padding: isMobile ? '10px 12px 120px' : '20px 20px 80px',
    color: '#fff',
    paddingTop: isMobile ? '80px' : '100px',
    minHeight: '100vh',
  };

  const darkGlass = {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '24px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  };

  const stepCardStyle = {
    ...darkGlass,
    padding: isMobile ? '24px 20px' : '32px 28px',
    opacity: animating ? 0 : 1,
    transform: animating
      ? (animDir === 'forward' ? 'translateX(20px)' : 'translateX(-20px)')
      : 'translateX(0)',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '14px',
    color: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
    display: 'block',
  };

  const btnPrimary = {
    background: 'linear-gradient(135deg, #007AFF, #0051D5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,122,255,0.4)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
  };

  const btnSecondary = {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  };

  const radioStyle = (selected) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '14px',
    border: selected ? '1px solid rgba(0,122,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
    background: selected ? 'rgba(0,122,255,0.15)' : 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '8px',
  });

  // ─── Step Progress Indicator ────────────────────────────────────────────
  const renderProgress = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: 0 }}>
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {/* Node */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCompleted
                  ? 'linear-gradient(135deg, #34C759, #28A745)'
                  : isActive
                    ? 'linear-gradient(135deg, #007AFF, #0051D5)'
                    : 'rgba(255,255,255,0.08)',
                border: isActive
                  ? '2px solid rgba(0,122,255,0.5)'
                  : isCompleted
                    ? '2px solid rgba(52,199,89,0.5)'
                    : '2px solid rgba(255,255,255,0.15)',
                boxShadow: isActive
                  ? '0 0 20px rgba(0,122,255,0.5)'
                  : isCompleted
                    ? '0 0 12px rgba(52,199,89,0.3)'
                    : 'none',
                transition: 'all 0.4s ease',
              }}>
                {isCompleted
                  ? <CheckCircle size={20} color="#fff" />
                  : <step.icon size={18} color={isActive ? '#fff' : 'rgba(255,255,255,0.4)'} />
                }
              </div>
              {/* Label */}
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#fff' : isCompleted ? '#34C759' : 'rgba(255,255,255,0.4)',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
              }}>{step.label}</span>
            </div>
            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div style={{
                height: '2px',
                width: isMobile ? '60px' : '80px',
                background: currentStep > step.id
                  ? 'linear-gradient(to right, #34C759, #007AFF)'
                  : 'rgba(255,255,255,0.1)',
                marginBottom: '24px',
                transition: 'background 0.4s ease',
                borderRadius: '2px',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ─── Step 1: Lokasi ────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div style={stepCardStyle}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>📍 Tentukan Lokasi</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px', lineHeight: 1.5 }}>
        GPS otomatis mendeteksi posisi Anda. Ketuk peta untuk pindahkan pin ke lokasi jalan rusak yang tepat.
      </p>

      {/* Map */}
      <div style={{ height: '300px', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
        {activeCoords ? (
          <MapContainer center={[activeCoords.lat, activeCoords.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker onLocationSelect={setManualCoords} />
            <Marker position={[activeCoords.lat, activeCoords.lng]}>
              <Popup>{manualCoords ? 'Lokasi dipilih manual' : 'Lokasi GPS Anda'}</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(0,122,255,0.4)', borderTopColor: '#007AFF', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Mencari lokasi GPS...</p>
          </div>
        )}
      </div>

      {/* Coords display */}
      {activeCoords && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Latitude', value: activeCoords.lat.toFixed(6) },
            { label: 'Longitude', value: activeCoords.lng.toFixed(6) },
          ].map(item => (
            <div key={item.label} style={{ flex: 1, padding: '12px 14px', background: 'rgba(0,122,255,0.1)', borderRadius: '14px', border: '1px solid rgba(0,122,255,0.2)' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', fontFamily: 'monospace' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {manualCoords && (
        <button
          onClick={() => setManualCoords(null)}
          style={{ ...btnSecondary, width: '100%', marginBottom: '16px', fontSize: '13px', padding: '10px' }}
        >
          <Navigation2 size={14} /> Reset ke GPS
        </button>
      )}

      <button
        disabled={!canProceedStep1}
        onClick={() => goToStep(2)}
        style={{ ...btnPrimary, opacity: canProceedStep1 ? 1 : 0.4, cursor: canProceedStep1 ? 'pointer' : 'not-allowed' }}
      >
        Lanjut: Ambil Foto <ChevronRight size={18} />
      </button>
    </div>
  );

  // ─── Step 2: Foto ──────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div style={stepCardStyle}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>📸 Bukti Foto</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px', lineHeight: 1.5 }}>
        Ambil foto langsung atau unggah dari galeri ponsel Anda.
      </p>

      {/* Toggle camera/gallery */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { key: false, label: 'Kamera Langsung', icon: Camera },
          { key: true, label: 'Galeri Foto', icon: Upload },
        ].map(opt => (
          <button
            key={String(opt.key)}
            onClick={() => { setUseGallery(opt.key); setImage(null); setImageFile(null); }}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: '10px',
              border: 'none',
              background: useGallery === opt.key ? 'rgba(0,122,255,0.8)' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <opt.icon size={15} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Camera / Gallery area */}
      <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', background: '#000', aspectRatio: '4/3', position: 'relative' }}>
        {image ? (
          <img src={image} alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : useGallery ? (
          <div
            onClick={() => fileInputRef.current.click()}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', gap: '12px' }}
          >
            <div style={{ padding: '20px', background: 'rgba(0,122,255,0.15)', borderRadius: '20px', border: '1px solid rgba(0,122,255,0.3)' }}>
              <Upload size={36} color="#007AFF" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: '500' }}>Ketuk untuk pilih foto</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>JPG, PNG, HEIC</p>
          </div>
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            height="100%"
            videoConstraints={{ facingMode, aspectRatio: 4 / 3 }}
            style={{ objectFit: 'cover' }}
          />
        )}
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {image ? (
          <button onClick={() => { setImage(null); setImageFile(null); }} style={{ ...btnSecondary, flex: 1 }}>
            <RotateCcw size={16} /> Ambil Ulang
          </button>
        ) : useGallery ? (
          <button onClick={() => fileInputRef.current.click()} style={{ ...btnPrimary }}>
            <Upload size={16} /> Pilih dari Galeri
          </button>
        ) : (
          <>
            <button onClick={toggleCamera} style={{ ...btnSecondary }} title="Ganti Kamera">
              <SwitchCamera size={18} />
            </button>
            <button onClick={capture} style={{ ...btnPrimary }}>
              <Camera size={18} /> Ambil Foto
            </button>
          </>
        )}
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => goToStep(1)} style={{ ...btnSecondary, flex: 0, padding: '16px 20px' }}>
          <ChevronLeft size={18} />
        </button>
        <button
          disabled={!canProceedStep2}
          onClick={() => goToStep(3)}
          style={{ ...btnPrimary, opacity: canProceedStep2 ? 1 : 0.4, cursor: canProceedStep2 ? 'pointer' : 'not-allowed' }}
        >
          Lanjut: Isi Deskripsi <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  // ─── Step 3: Deskripsi ──────────────────────────────────────────────────
  const renderStep3 = () => (
    <div style={stepCardStyle}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>📋 Deskripsi Kerusakan</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '24px', lineHeight: 1.5 }}>
        Lengkapi informasi untuk membantu penanganan yang lebih tepat.
      </p>

      {/* Damage type */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Kategori Kerusakan</label>
        <select
          value={damageType}
          onChange={e => setDamageType(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Pilih Kategori</option>
          {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Severity */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Tingkat Kerusakan</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {SEVERITY_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setDamageSeverity(level)}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '14px',
                border: damageSeverity === level ? '2px solid #007AFF' : '1px solid rgba(255,255,255,0.12)',
                background: damageSeverity === level ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Traffic impact */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Dampak Lalu Lintas</label>
        {TRAFFIC_IMPACTS.map(item => (
          <div
            key={item.value}
            onClick={() => setTrafficImpact(item.value)}
            style={radioStyle(trafficImpact === item.value)}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: trafficImpact === item.value ? '2px solid #007AFF' : '2px solid rgba(255,255,255,0.3)',
              background: trafficImpact === item.value ? '#007AFF' : 'transparent',
              flexShrink: 0,
              marginTop: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {trafficImpact === item.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff', marginBottom: '2px' }}>{item.value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>
          <MessageSquare size={13} style={{ display: 'inline', marginRight: '4px' }} />
          Deskripsi (Opsional)
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Jelaskan kondisi kerusakan secara detail..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => goToStep(2)} style={{ ...btnSecondary, flex: 0, padding: '16px 20px' }}>
          <ChevronLeft size={18} />
        </button>
        <button
          disabled={isSubmitting || !damageType}
          onClick={handleSubmit}
          style={{
            ...btnPrimary,
            opacity: (!isSubmitting && damageType) ? 1 : 0.5,
            cursor: (!isSubmitting && damageType) ? 'pointer' : 'not-allowed',
            background: 'linear-gradient(135deg, #34C759, #28A745)',
            boxShadow: '0 4px 20px rgba(52,199,89,0.4)',
          }}
        >
          <Send size={18} />
          {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </div>
    </div>
  );

  const renderSinglePageForm = () => (
    <div style={{ ...darkGlass, padding: isMobile ? '24px 20px' : '32px 28px' }}>
      {/* Section 1: Lokasi */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>📍 1. Tentukan Lokasi</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', lineHeight: 1.5 }}>
          GPS otomatis mendeteksi posisi Anda. Ketuk peta untuk pindahkan pin ke lokasi jalan rusak yang tepat.
        </p>

        {/* Map */}
        <div style={{ height: '260px', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
          {activeCoords ? (
            <MapContainer center={[activeCoords.lat, activeCoords.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker onLocationSelect={setManualCoords} />
              <Marker position={[activeCoords.lat, activeCoords.lng]}>
                <Popup>{manualCoords ? 'Lokasi dipilih manual' : 'Lokasi GPS Anda'}</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(0,122,255,0.4)', borderTopColor: '#007AFF', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Mencari lokasi GPS...</p>
            </div>
          )}
        </div>

        {/* Coords display */}
        {activeCoords && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Latitude', value: activeCoords.lat.toFixed(6) },
              { label: 'Longitude', value: activeCoords.lng.toFixed(6) },
            ].map(item => (
              <div key={item.label} style={{ flex: 1, padding: '10px 12px', background: 'rgba(0,122,255,0.08)', borderRadius: '12px', border: '1px solid rgba(0,122,255,0.15)' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', fontFamily: 'monospace' }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {manualCoords && (
          <button
            onClick={() => setManualCoords(null)}
            style={{ ...btnSecondary, width: '100%', marginBottom: '16px', fontSize: '13px', padding: '10px' }}
          >
            <Navigation2 size={14} /> Reset ke GPS
          </button>
        )}
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '32px' }} />

      {/* Section 2: Foto */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>📸 2. Bukti Foto</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', lineHeight: 1.5 }}>
          Ambil foto langsung atau unggah dari galeri ponsel Anda.
        </p>

        {/* Toggle camera/gallery */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { key: false, label: 'Kamera Langsung', icon: Camera },
            { key: true, label: 'Galeri Foto', icon: Upload },
          ].map(opt => (
            <button
              key={String(opt.key)}
              onClick={() => { setUseGallery(opt.key); setImage(null); setImageFile(null); }}
              type="button"
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                background: useGallery === opt.key ? 'rgba(0,122,255,0.8)' : 'transparent',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Camera / Gallery area */}
        <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', background: '#000', aspectRatio: '4/3', position: 'relative' }}>
          {image ? (
            <img src={image} alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : useGallery ? (
            <div
              onClick={() => fileInputRef.current.click()}
              style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', gap: '12px' }}
            >
              <div style={{ padding: '16px', background: 'rgba(0,122,255,0.15)', borderRadius: '20px', border: '1px solid rgba(0,122,255,0.3)' }}>
                <Upload size={28} color="#007AFF" />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500' }}>Ketuk untuk pilih foto</p>
            </div>
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              height="100%"
              videoConstraints={{ facingMode, aspectRatio: 4 / 3 }}
              style={{ objectFit: 'cover' }}
            />
          )}
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </div>

        {/* Capture / select buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {image ? (
            <button onClick={() => { setImage(null); setImageFile(null); }} type="button" style={{ ...btnSecondary, flex: 1 }}>
              <RotateCcw size={16} /> Ambil Ulang
            </button>
          ) : useGallery ? (
            <button onClick={() => fileInputRef.current.click()} type="button" style={{ ...btnPrimary }}>
              <Upload size={16} /> Pilih dari Galeri
            </button>
          ) : (
            <>
              <button onClick={toggleCamera} style={{ ...btnSecondary }} title="Ganti Kamera" type="button">
                <SwitchCamera size={18} />
              </button>
              <button onClick={capture} style={{ ...btnPrimary }} type="button">
                <Camera size={18} /> Ambil Foto
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '32px' }} />

      {/* Section 3: Deskripsi & Kategori */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>📋 3. Informasi Tambahan</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px', lineHeight: 1.5 }}>
          Lengkapi detail kerusakan untuk membantu proses verifikasi.
        </p>

        {/* Damage type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Kategori Kerusakan</label>
          <select
            value={damageType}
            onChange={e => setDamageType(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Pilih Kategori</option>
            {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Severity */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Tingkat Kerusakan</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {SEVERITY_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => setDamageSeverity(level)}
                type="button"
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: '14px',
                  border: damageSeverity === level ? '2px solid #007AFF' : '1px solid rgba(255,255,255,0.12)',
                  background: damageSeverity === level ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Traffic impact */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Dampak Lalu Lintas</label>
          {TRAFFIC_IMPACTS.map(item => (
            <div
              key={item.value}
              onClick={() => setTrafficImpact(item.value)}
              style={radioStyle(trafficImpact === item.value)}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: trafficImpact === item.value ? '2px solid #007AFF' : '2px solid rgba(255,255,255,0.3)',
                background: trafficImpact === item.value ? '#007AFF' : 'transparent',
                flexShrink: 0,
                marginTop: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {trafficImpact === item.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff', marginBottom: '2px' }}>{item.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>
            <MessageSquare size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Deskripsi (Opsional)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Jelaskan kondisi kerusakan secara detail..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        disabled={isSubmitting || !activeCoords || !image || !damageType}
        onClick={handleSubmit}
        style={{
          ...btnPrimary,
          opacity: (!isSubmitting && activeCoords && image && damageType) ? 1 : 0.5,
          cursor: (!isSubmitting && activeCoords && image && damageType) ? 'pointer' : 'not-allowed',
          background: 'linear-gradient(135deg, #34C759, #28A745)',
          boxShadow: '0 4px 20px rgba(52,199,89,0.4)',
          width: '100%',
        }}
      >
        <Send size={18} />
        {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan'}
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        select option {
          background-color: #1a1a1a !important;
          color: #fff !important;
        }
      `}</style>

      <div style={containerStyle}>
        {/* Header */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => window.location.href = "/dashboard"}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            title="Kembali ke Beranda"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 style={{
            fontSize: isMobile ? '24px' : '40px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #fff 0%, #3b82f6 50%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-1px',
            marginBottom: '8px',
            paddingLeft: isMobile ? '45px' : '0',
            paddingRight: isMobile ? '45px' : '0'
          }}>
            Lapor Jalan Rusak
          </h1>
          {variant !== 'A' && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Langkah {currentStep} dari {STEPS.length}
            </p>
          )}
        </div>

        {/* UC2: Multi-step Form (B) vs Single-page Form (A) */}
        {variant === 'A' ? (
          renderSinglePageForm()
        ) : (
          <>
            {/* Progress */}
            {renderProgress()}

            {/* Steps */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </>
        )}
      </div>
    </>
  );
}

export default FormLapor;