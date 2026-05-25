import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map, MapPin, User, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { colors, borderRadius, shadows, transitions } from '../designSystem';
import config from "../config";
import { useAlert } from './AlertContext';
import { useLocation, Link } from 'react-router-dom';
import { useABVariant } from '../utils/abTesting';

// Custom Marker Icons
const createIcon = (color) => {
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  Darurat: createIcon('red'),
  Tinggi: createIcon('orange'),
  Sedang: createIcon('blue'),
  Rendah: createIcon('green'),
  Berat: createIcon('red'),
  Ringan: createIcon('green'),
  Default: createIcon('blue')
};

// Component to handle map center changes
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1
      });
    }
  }, [center, zoom, map]);

  return null;
}

function Peta() {
  const variant = useABVariant();
  const [reports, setReports] = useState([]);
  const [mapCenter, setMapCenter] = useState([-7.7956, 110.3695]);
  const [mapZoom, setMapZoom] = useState(13);
  const { showAlert } = useAlert();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.center) {
      setMapCenter(location.state.center);
      setMapZoom(location.state.zoom || 17);
    }
  }, [location.state]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter States
  const [filterCategory, setFilterCategory] = useState("");
  const [showOnlyMyReports, setShowOnlyMyReports] = useState(false);
  const currentUserName = localStorage.getItem('nama');

  const DAMAGE_TYPES = [
    "Jalan berlubang", "Retak memanjang", "Retak melebar", "Aspal terkelupas",
    "Jalan amblas", "Jalan bergelombang", "Tergenang air", "Longsor kecil",
    "Marka jalan rusak", "Bahu jalan rusak"
  ];

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${config.apiUrl}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(res.data.data);
      } catch (err) {
        showAlert("Gagal memuat peta sebaran. Silakan coba beberapa saat lagi.", "error");
      }
    };
    fetchReports();
  }, []);

  // Filter Logic
  const filteredReports = reports.filter(report => {
    if (filterCategory && (report.damageType || report.title) !== filterCategory) return false;
    if (showOnlyMyReports && report.pelapor?.nama !== currentUserName) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return colors.warning;
      case 'proses': return colors.info;
      case 'selesai': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const parseImpactedVehicles = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [data];
    }
  };

  // Styles
  const darkGlassCard = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.xl,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: isMobile ? '10px' : '20px',
    color: '#fff',
    paddingTop: isMobile ? '80px' : '20px',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: isMobile ? '20px' : '40px',
  };

  const titleStyle = {
    fontSize: isMobile ? '32px' : '56px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #fff 0%, #3b82f6 50%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px',
    letterSpacing: isMobile ? '-1px' : '-2px',
    filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))',
  };

  const subtitleStyle = {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
    letterSpacing: '0.5px',
  };

  const mapSectionStyle = {
    ...darkGlassCard,
    padding: isMobile ? '12px' : '24px',
    marginBottom: isMobile ? '20px' : '40px',
  };

  const mapTitleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const mapContainerWrapperStyle = {
    position: 'relative',
    height: isMobile ? '450px' : '600px',
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    boxShadow: shadows.lg,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const selectStyle = {
    padding: '8px 16px',
    borderRadius: borderRadius.lg,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    outline: 'none',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  };

  return (
    <>
      <style>
        {`
          select option {
            background-color: #1a1a1a !important;
            color: #fff !important;
          }
        `}
      </style>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '24px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
            }}>
              <Map size={40} color="#3b82f6" />
            </div>
          </div>
          <h1 style={titleStyle}>Peta Sebaran Laporan</h1>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
            margin: '20px auto',
            borderRadius: '2px',
          }} />
          <p style={subtitleStyle}>Pantau lokasi sebaran seluruh laporan kerusakan jalan secara real-time</p>
        </div>

        {/* Map Section */}
        <div style={mapSectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ ...mapTitleStyle, marginBottom: 0 }}>
              <MapPin size={28} color={colors.primary} />
              Peta Interaktif
            </h2>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap',
              width: isMobile ? '100%' : 'auto'
            }}>
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  ...selectStyle,
                  flex: isMobile ? 1 : 'initial',
                  minWidth: isMobile ? '130px' : 'auto'
                }}
              >
                <option value="">Semua Kategori</option>
                {DAMAGE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* My Reports Filter Toggle */}
              <button
                onClick={() => setShowOnlyMyReports(!showOnlyMyReports)}
                style={{
                  ...selectStyle,
                  background: showOnlyMyReports ? colors.primary : 'rgba(255,255,255,0.05)',
                  color: showOnlyMyReports ? '#fff' : 'rgba(255,255,255,0.7)',
                  border: `1px solid ${showOnlyMyReports ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flex: isMobile ? 1 : 'initial',
                  minWidth: isMobile ? '130px' : 'auto'
                }}
              >
                <User size={16} />
                <span>{showOnlyMyReports ? 'Semua Laporan' : 'Laporan Saya'}</span>
              </button>
            </div>
          </div>

          {/* Map Color Legend */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: borderRadius.lg,
            border: '1px solid rgba(255,255,255,0.05)',
            width: 'fit-content',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '12px', color: '#aaa', marginRight: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Tingkat Prioritas:</div>
            {[
              { label: 'Darurat', color: '#ef4444' }, // Red
              { label: 'Tinggi', color: '#f97316' },  // Orange
              { label: 'Sedang', color: '#3b82f6' },  // Blue
              { label: 'Rendah', color: '#10b981' }   // Green
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${item.color}80` }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={mapContainerWrapperStyle}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapController center={mapCenter} zoom={mapZoom} />
              {filteredReports.map((lap) => (
                <Marker
                  key={lap.id}
                  position={[Number(lap.latitude), Number(lap.longitude)]}
                  icon={icons[lap.priority] || icons[lap.damageSeverity] || icons.Default}
                >
                  <Popup>
                    <div style={{ minWidth: '200px', textAlign: 'left', color: '#000' }}>
                      <img
                        src={lap.photo.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo.split(/[\\/]/).pop()}`}
                        alt="Bukti"
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                      />
                      <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                        {lap.damageType || lap.title}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px', fontSize: '11px', marginBottom: '8px', color: '#666' }}>
                        <div style={{ fontWeight: '600' }}>Tingkat:</div>
                        <div>{lap.damageSeverity || '-'}</div>

                        <div style={{ fontWeight: '600' }}>Dampak:</div>
                        <div>{lap.trafficImpact || '-'}</div>

                        <div style={{ fontWeight: '600' }}>Kendaraan:</div>
                        <div>
                          {parseImpactedVehicles(lap.impactedVehicles).join(', ') || '-'}
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', marginBottom: '8px', borderTop: '1px solid #eee', paddingTop: '4px' }}>
                        {lap.description}
                      </div>

                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: `${getStatusColor(lap.status)}20`,
                        color: getStatusColor(lap.status),
                      }}>
                        {lap.status}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Variant B — hidden for admin */}
      {variant === 'B' && localStorage.getItem('role') !== 'admin' && (
        <Link
          to="/lapor"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000,
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(37, 99, 235, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
        >
          <Plus size={32} strokeWidth={2.5} />
        </Link>
      )}
    </>
  );
}

export default Peta;
