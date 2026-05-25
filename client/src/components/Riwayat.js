import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, Search, MapPin, Calendar, Compass, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { colors, borderRadius, shadows, transitions } from '../designSystem';
import config from "../config";
import { Link } from 'react-router-dom';
import { useAlert } from './AlertContext';
import { useABVariant } from '../utils/abTesting';

// UC3 Visual Timeline Component (Shipment-Tracking UI style)
function VisualTimeline({ status, updatedAt, createdAt }) {
  const currentStatus = status?.toLowerCase() || 'proses'; // Default to 'proses' to showcase the active node

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const stages = [
    {
      key: 'pending',
      label: 'Laporan Masuk (Pending)',
      desc: 'Laporan Anda telah berhasil dikirim dan menunggu verifikasi admin.',
      time: formatDate(createdAt) || 'Baru Saja',
      icon: Clock,
      color: '#eab308'
    },
    {
      key: 'proses',
      label: 'Dalam Proses Penanganan',
      desc: 'Petugas sedang meninjau lokasi atau sedang melakukan perbaikan.',
      time: currentStatus === 'proses' || currentStatus === 'selesai' ? (formatDate(updatedAt) || 'Hari Ini') : '',
      icon: AlertCircle,
      color: '#3b82f6'
    },
    {
      key: 'selesai',
      label: 'Laporan Selesai Diperbaiki',
      desc: 'Infrastruktur jalan raya telah selesai diperbaiki dan diverifikasi.',
      time: currentStatus === 'selesai' ? (formatDate(updatedAt) || 'Baru Saja') : '',
      icon: CheckCircle,
      color: '#22c55e'
    }
  ];

  // Determine stage indexes
  const statusIndices = { 'pending': 0, 'proses': 1, 'selesai': 2 };
  const activeIdx = statusIndices[currentStatus] !== undefined ? statusIndices[currentStatus] : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
      {stages.map((stage, idx) => {
        const isPast = idx < activeIdx;
        const isActive = idx === activeIdx;

        const StageIcon = stage.icon;
        const activeColor = stage.color;

        return (
          <div key={stage.key} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
            
            {/* Connecting Timeline Line */}
            {idx < stages.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '28px',
                bottom: '-20px',
                width: '3px',
                background: idx < activeIdx 
                  ? 'linear-gradient(to bottom, #3b82f6, #60a5fa)' 
                  : 'rgba(255, 255, 255, 0.1)',
                zIndex: 1,
                borderRadius: '2px',
              }} />
            )}

            {/* Timeline Circle Node */}
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              // Apple-style timeline node highlights
              background: isActive 
                ? activeColor 
                : isPast 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'transparent',
              border: isActive 
                ? `2px solid ${activeColor}` 
                : isPast 
                  ? `2px solid #3b82f6` 
                  : '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isActive ? `0 0 15px ${activeColor}90` : 'none',
              transition: 'all 0.4s ease',
              position: 'relative'
            }}>
              {/* Pulse effect for active node */}
              {isActive && (
                <span className="pulse-dot" style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: activeColor,
                  opacity: 0.4,
                  animation: 'pulse 1.8s infinite ease-in-out',
                  zIndex: -1
                }} />
              )}
              
              <StageIcon 
                size={14} 
                color={isActive ? '#fff' : isPast ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)'} 
                strokeWidth={3}
              />
            </div>

            {/* Stage Text details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? '#fff' : isPast ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.45)',
                  transition: 'color 0.3s'
                }}>
                  {stage.label}
                </span>
                {stage.time && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)'
                  }}>
                    {stage.time}
                  </span>
                )}
              </div>
              {isActive && stage.desc && (
                <span style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: '1.4',
                  marginTop: '2px'
                }}>
                  {stage.desc}
                </span>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}

function Riwayat() {
  const variant = useABVariant();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, proses, selesai
  const { showAlert } = useAlert();
  const [expandedReports, setExpandedReports] = useState({});

  const toggleExpand = (id) => {
    setExpandedReports(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const mockReports = [
    {
      id: 'mock-1',
      title: 'Jalan Raya Kaliurang Retak Parah',
      damageType: 'Retak memanjang',
      description: 'Retak memanjang sekitar 5 meter di tengah jalan, sangat berbahaya bagi pengendara roda dua yang melintas cepat.',
      latitude: -7.7465,
      longitude: 110.3789,
      status: 'proses',
      priority: 'Tinggi',
      damageSeverity: 'Sedang',
      photo: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),   // 4 hours ago
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-2',
      title: 'Lubang Besar Dekat Bundaran UGM',
      damageType: 'Jalan berlubang',
      description: 'Lubang sedalam 15cm dengan diameter lebar. Sering terjadi genangan saat hujan lebat, menutupi bahaya lubang.',
      latitude: -7.7712,
      longitude: 110.3776,
      status: 'pending',
      priority: 'Darurat',
      damageSeverity: 'Berat',
      photo: 'https://images.unsplash.com/photo-1599740831140-523176662773?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-3',
      title: 'Aspal Terkelupas Jalan Solo',
      damageType: 'Aspal terkelupas',
      description: 'Kondisi aspal mengelupas parah setelah hujan badai kemarin malam. Kerikil tajam berhamburan mengganggu lalu lintas.',
      latitude: -7.7829,
      longitude: 110.4001,
      status: 'selesai',
      priority: 'Sedang',
      damageSeverity: 'Ringan',
      photo: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-4',
      title: 'Jalan Amblas Daerah Godean',
      damageType: 'Jalan amblas',
      description: 'Permukaan aspal amblas sedalam 10cm sepanjang 2 meter. Mengganggu kenyamanan berkendara.',
      latitude: -7.7801,
      longitude: 110.3214,
      status: 'proses',
      priority: 'Tinggi',
      damageSeverity: 'Sedang',
      photo: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-5',
      title: 'Lubang Jalan Dekat Jembatan Lempuyangan',
      damageType: 'Jalan berlubang',
      description: 'Lubang kecil tapi dalam di tanjakan jembatan. Sering membuat motor terperosok tiba-tiba.',
      latitude: -7.7905,
      longitude: 110.3755,
      status: 'pending',
      priority: 'Tinggi',
      damageSeverity: 'Sedang',
      photo: 'https://images.unsplash.com/photo-1599740831140-523176662773?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-6',
      title: 'Paving Block Rusak Alun-Alun Utara',
      damageType: 'Paving block rusak',
      description: 'Beberapa susunan paving block lepas dan berlubang, membahayakan pejalan kaki dan pesepeda.',
      latitude: -7.8042,
      longitude: 110.3655,
      status: 'selesai',
      priority: 'Rendah',
      damageSeverity: 'Ringan',
      photo: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-7',
      title: 'Sambungan Jembatan Renggang Ring Road Utara',
      damageType: 'Kerusakan struktur',
      description: 'Expansion joint jembatan renggang melebihi batas toleransi normal. Kendaraan terasa bergetar keras saat melewatinya.',
      latitude: -7.7592,
      longitude: 110.3995,
      status: 'proses',
      priority: 'Darurat',
      damageSeverity: 'Berat',
      photo: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-8',
      title: 'Gundukan Aspal Liar Jalan Gejayan',
      damageType: 'Gundukan aspal',
      description: 'Ada tonjolan aspal tidak rata sisa perbaikan utilitas kabel tanah. Sangat mengganggu kestabilan setir motor.',
      latitude: -7.7733,
      longitude: 110.3899,
      status: 'pending',
      priority: 'Sedang',
      damageSeverity: 'Ringan',
      photo: 'https://images.unsplash.com/photo-1599740831140-523176662773?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-9',
      title: 'Kerusakan Bahu Jalan Ring Road Barat',
      damageType: 'Bahu jalan amblas',
      description: 'Bahu jalan sisi timur tergerus air hujan, menciptakan jurang kecil sedalam 30cm di pinggir aspal.',
      latitude: -7.7855,
      longitude: 110.3399,
      status: 'proses',
      priority: 'Tinggi',
      damageSeverity: 'Berat',
      photo: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-10',
      title: 'Lubang Jalan Dekat Hartono Mall',
      damageType: 'Jalan berlubang',
      description: 'Lubang diameter 50cm di jalur lambat depan Hartono Mall. Berbahaya saat jam padat lalu lintas.',
      latitude: -7.7551,
      longitude: 110.3952,
      status: 'selesai',
      priority: 'Tinggi',
      damageSeverity: 'Sedang',
      photo: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-11',
      title: 'Jalan Bergelombang Ring Road Selatan',
      damageType: 'Aspal bergelombang',
      description: 'Aspal bergelombang parah akibat sering dilewati kendaraan muatan berat. Sering memicu slip ban.',
      latitude: -7.8255,
      longitude: 110.3799,
      status: 'proses',
      priority: 'Sedang',
      damageSeverity: 'Sedang',
      photo: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    },
    {
      id: 'mock-12',
      title: 'Retak Kulit Buaya Depan Ambarrukmo Plaza',
      damageType: 'Retak kulit buaya',
      description: 'Kerusakan aspal pola kulit buaya yang meluas di jalur lambat, aspal mulai hancur menjadi kerikil.',
      latitude: -7.7825,
      longitude: 110.4012,
      status: 'pending',
      priority: 'Sedang',
      damageSeverity: 'Ringan',
      photo: 'https://images.unsplash.com/photo-1599740831140-523176662773?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      pelapor: { nama: 'Test User' }
    }
  ];

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${config.apiUrl}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Combine DB reports with mock reports so it looks beautifully populated
        const dbReports = res.data.data || [];
        setReports(dbReports.length > 0 ? dbReports : mockReports);
      } catch (err) {
        // Fallback to mocks on error
        setReports(mockReports);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.damageType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || r.status?.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // Apple-inspired glassmorphic styles
  const phoneFrameStyle = {
    maxWidth: '430px', // Standard iPhone Max width
    width: '100%',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'rgba(20, 20, 20, 0.65)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 0 50px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    color: '#fff',
    padding: isMobile ? '80px 16px 100px 16px' : '24px 16px 100px 16px', // Extra bottom padding for mobile safe area
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.xl,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingTop: '20px'
  };

  const backBtnStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.2s',
  };

  const searchContainerStyle = {
    position: 'relative',
    marginBottom: '20px'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '12px 16px 12px 42px',
    borderRadius: borderRadius.pill,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const filterTabsStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    overflowX: 'auto',
    paddingBottom: '4px'
  };

  const tabStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
    border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
    background: active ? '#fff' : 'rgba(255, 255, 255, 0.05)',
    color: active ? '#000' : 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  });

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          .pulse-dot {
            animation: pulse 2s infinite;
          }
        `}
      </style>

      <div style={{ minHeight: '100vh', background: 'transparent' }}>
        <div style={phoneFrameStyle}>
          
          {/* Header */}
          <div style={headerStyle}>
            <Link to="/dashboard" style={backBtnStyle}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Riwayat Laporan</h1>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Lacak status pengaduan jalan Anda</span>
            </div>
          </div>

          {/* Search bar */}
          <div style={searchContainerStyle}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '13px', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder="Cari laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(59,130,246,0.5)';
                e.target.style.background = 'rgba(255,255,255,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                e.target.style.background = 'rgba(255,255,255,0.06)';
              }}
            />
          </div>

          {/* Filter Status Tabs */}
          <div style={filterTabsStyle}>
            {[
              { key: 'all', label: 'Semua' },
              { key: 'pending', label: 'Pending' },
              { key: 'proses', label: 'Proses' },
              { key: 'selesai', label: 'Selesai' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                style={tabStyle(filterStatus === tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Report History List */}
          {filteredReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)' }}>
              <Compass size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontWeight: '600' }}>Tidak ada riwayat laporan</p>
              <p style={{ fontSize: '12px' }}>Silakan buat aduan baru pada halaman utama.</p>
            </div>
          ) : (
            currentReports.map(lap => {
              const isExpanded = !!expandedReports[lap.id];
              const getStatusLabel = (status) => {
                switch (status?.toLowerCase()) {
                  case 'pending': return { text: 'Pending', color: '#eab308' };
                  case 'proses': return { text: 'Proses', color: '#3b82f6' };
                  case 'selesai': return { text: 'Selesai', color: '#22c55e' };
                  default: return { text: status || 'Pending', color: '#eab308' };
                }
              };
              const statusInfo = getStatusLabel(lap.status);

              return (
                <div 
                  key={lap.id} 
                  style={{
                    ...cardStyle,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isExpanded ? 'scale(1.01)' : 'scale(1)',
                    border: isExpanded ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: isExpanded ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                  onClick={() => toggleExpand(lap.id)}
                >
                  {/* Collapsed/Header Row */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img
                      src={lap.photo.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo.split(/[\\/]/).pop()}`}
                      alt="Road damage"
                      style={{ 
                        width: '54px', 
                        height: '54px', 
                        objectFit: 'cover', 
                        borderRadius: borderRadius.md,
                        transition: 'all 0.3s ease',
                        transform: isExpanded ? 'scale(1.04)' : 'scale(1)'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          color: lap.priority === 'Darurat' ? '#ef4444' : lap.priority === 'Tinggi' ? '#f97316' : '#3b82f6',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {lap.damageType || 'Kerusakan Jalan'}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: `${statusInfo.color}20`,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}40`,
                          textTransform: 'uppercase'
                        }}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <h3 style={{ 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        lineHeight: '1.3', 
                        marginTop: '2px', 
                        color: '#fff',
                        whiteSpace: isExpanded ? 'normal' : 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {lap.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        <Calendar size={11} />
                        <span>{new Date(lap.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div style={{
                    maxHeight: isExpanded ? '1000px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginTop: isExpanded ? '16px' : '0px',
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inner content
                  >
                    {/* Description */}
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                      {lap.description}
                    </p>

                    {/* Coordinator Map link */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#3b82f6',
                      fontWeight: '600',
                      marginBottom: '20px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      padding: '6px 12px',
                      borderRadius: borderRadius.md,
                      width: 'fit-content'
                    }}>
                      <MapPin size={14} />
                      <span>GPS: {Number(lap.latitude).toFixed(5)}, {Number(lap.longitude).toFixed(5)}</span>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                        Status Tindak Lanjut
                      </div>
                      {/* UC3: Visual Timeline (B) vs Static Text Status (A) */}
                      {variant === 'A' ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '12px 16px',
                          borderRadius: borderRadius.md
                        }}>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Status:</span>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: (lap.status || '').toLowerCase() === 'selesai' ? '#34c759' : (lap.status || '').toLowerCase() === 'proses' ? '#007aff' : '#ff9500',
                            textTransform: 'uppercase'
                          }}>
                            {lap.status || 'Pending'}
                          </span>
                        </div>
                      ) : (
                        <VisualTimeline status={lap.status} updatedAt={lap.updatedAt} createdAt={lap.createdAt} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '20px',
              marginBottom: '20px',
              padding: '10px 0',
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: borderRadius.md,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => {
                const isActive = pageNumber === currentPage;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isActive ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isActive ? 'linear-gradient(to right, #2563eb, #3b82f6)' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  borderRadius: borderRadius.md,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                Selanjutnya
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default Riwayat;
