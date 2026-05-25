import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, User, AlertCircle, CheckCircle, Clock, Navigation, Plus, FileText } from 'lucide-react';
import { colors, borderRadius, shadows, transitions } from '../designSystem';
import config from "../config";
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from './AlertContext';
import { useABVariant } from '../utils/abTesting';

// ─── UC3: Vertical Timeline Component ──────────────────────────────────────────
function VerticalTimeline({ status }) {
  const stages = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'proses', label: 'Proses', icon: AlertCircle },
    { key: 'selesai', label: 'Selesai', icon: CheckCircle },
  ];

  const currentStatus = status?.toLowerCase() || 'pending';
  const currentIdx = stages.findIndex(s => s.key === currentStatus);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      marginTop: '8px',
      marginBottom: '8px',
    }}>
      {stages.map((stage, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isPastOrActive = idx <= currentIdx;
        const StageIcon = stage.icon;

        const accentColor = stage.key === 'pending'
          ? colors.warning
          : stage.key === 'proses'
            ? colors.info
            : colors.success;

        return (
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            {/* Timeline Line */}
            {idx < stages.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '9px',
                top: '18px',
                bottom: '-12px',
                width: '2px',
                background: idx < currentIdx ? accentColor : 'rgba(255, 255, 255, 0.1)',
                zIndex: 1,
                transition: 'all 0.3s ease',
              }} />
            )}

            {/* Node */}
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 2,
              background: isPastOrActive ? accentColor : 'transparent',
              border: `1.5px solid ${isPastOrActive ? accentColor : 'rgba(255, 255, 255, 0.2)'}`,
              boxShadow: isActive ? `0 0 8px ${accentColor}` : 'none',
            }}>
              <StageIcon size={10} color={isPastOrActive ? '#fff' : 'rgba(255, 255, 255, 0.4)'} />
            </div>

            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                color: isPastOrActive ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease',
              }}>
                {stage.label}
              </span>
              {isActive && (
                <span style={{
                  fontSize: '9px',
                  background: `${accentColor}20`,
                  color: accentColor,
                  padding: '1px 6px',
                  borderRadius: '100px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Aktif
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard() {
  const variant = useABVariant();
  const [reports, setReports] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { showAlert } = useAlert();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter States
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest
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
        showAlert("Gagal memuat laporan. Silakan coba beberapa saat lagi.", "error");
      }
    };
    fetchReports();
  }, []);

  // Filter & Sort Logic
  const filteredReports = reports
    .filter(report => {
      // Filter by Category
      if (filterCategory && (report.damageType || report.title) !== filterCategory) return false;

      // Filter by User's Own Reports
      if (showOnlyMyReports && report.pelapor?.nama !== currentUserName) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by Date
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Calculate Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, sortBy]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination Styles
  const paginationButtonStyle = (isActive) => ({
    padding: '8px 16px',
    borderRadius: borderRadius.lg,
    border: `1px solid ${isActive ? colors.primary : 'rgba(255,255,255,0.1)'}`,
    background: isActive ? colors.primary : 'rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: transitions.fast,
    fontWeight: isActive ? '600' : 'normal',
    outline: 'none',
  });

  const handleCardClick = (report) => {
    // Redirect to the Peta page and focus on the coordinates
    navigate("/peta", {
      state: {
        center: [Number(report.latitude), Number(report.longitude)],
        zoom: 17
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return colors.warning;
      case 'proses': return colors.info;
      case 'selesai': return colors.success;
      default: return colors.textSecondary;
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
    paddingTop: isMobile ? '80px' : '20px', // Space for fixed navbar
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

  const statCardStyle = (color) => ({
    ...darkGlassCard,
    padding: isMobile ? '16px 12px' : '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: `1px solid ${color}25`,
    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 15px ${color}10`,
    transition: 'transform 0.3s ease',
  });

  const cardsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: isMobile ? '16px' : '24px',
    marginBottom: '40px'
  };

  const cardStyle = (reportId) => ({
    ...darkGlassCard,
    padding: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: transitions.normal,
    transform: hoveredCard === reportId ? 'translateY(-8px)' : 'translateY(0)',
    boxShadow: hoveredCard === reportId ? '0 15px 30px rgba(0,0,0,0.5)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    border: hoveredCard === reportId ? `1px solid ${colors.primary}50` : '1px solid rgba(255, 255, 255, 0.1)',
  });

  const cardImageContainerStyle = {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
  };

  const cardImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: transitions.normal,
  };

  const cardOverlayStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
    padding: '20px',
    color: colors.white,
  };

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '4px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  };

  const cardLocationStyle = {
    fontSize: '13px',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const cardContentStyle = {
    padding: '20px',
  };

  const cardDescriptionStyle = {
    fontSize: '14px',
    color: '#ccc',
    lineHeight: '1.6',
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const cardMetaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const cardMetaItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#aaa',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#aaa',
    gridColumn: '1 / -1',
  };

  const clickHintStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(37, 99, 235, 0.9)',
    color: colors.white,
    padding: '6px 12px',
    borderRadius: borderRadius.pill,
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    opacity: hoveredCard ? 1 : 0,
    transition: transitions.fast,
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

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    cursor: 'pointer',
  };

  // Stats Calculations
  const totalCount = reports.length;
  const pendingCount = reports.filter(r => r.status?.toLowerCase() === 'pending').length;
  const prosesCount = reports.filter(r => r.status?.toLowerCase() === 'proses').length;
  const selesaiCount = reports.filter(r => r.status?.toLowerCase() === 'selesai').length;

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .cards-grid {
              grid-template-columns: 1fr !important;
            }
          }
          select option {
            background-color: #1a1a1a !important;
            color: #fff !important;
          }
        `}
      </style>

      {/* Image Modal */}
      {selectedImage && (
        <div style={modalOverlayStyle} onClick={() => setSelectedImage(null)}>
          <img
            src={selectedImage}
            alt="Full Size"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}

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
              <FileText size={40} color="#3b82f6" />
            </div>
          </div>
          <h1 style={titleStyle}>Dashboard Laporan</h1>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
            margin: '20px auto',
            borderRadius: '2px',
          }} />
          <p style={subtitleStyle}>Pantau laporan kerusakan jalan, status tindak lanjut, dan ajukan laporan baru</p>
        </div>

        {/* Statistics Cards Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Total Laporan', count: totalCount, color: '#3b82f6', desc: 'Aduan terdaftar' },
            { label: 'Menunggu', count: pendingCount, color: '#eab308', desc: 'Belum diproses' },
            { label: 'Diproses', count: prosesCount, color: '#06b6d4', desc: 'Dalam penanganan' },
            { label: 'Selesai', count: selesaiCount, color: '#22c55e', desc: 'Selesai diperbaiki' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={statCardStyle(item.color)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '36px', fontWeight: '900', color: item.color, textShadow: `0 0 15px ${item.color}30` }}>
                {item.count}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div style={{
          ...darkGlassCard,
          padding: isMobile ? '16px' : '16px 24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color={colors.primary} />
            Daftar Laporan Terkini
          </h2>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ ...selectStyle, flex: isMobile ? 1 : 'unset' }}
            >
              <option value="">Semua Kategori</option>
              {DAMAGE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ ...selectStyle, flex: isMobile ? 1 : 'unset' }}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
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
                flex: isMobile ? '1 1 100%' : 'unset',
              }}
            >
              <User size={16} />
              <span>{showOnlyMyReports ? 'Semua Laporan' : 'Laporan Saya'}</span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div style={cardsGridStyle} className="cards-grid">
          {currentItems.length === 0 ? (
            <div style={emptyStateStyle}>
              <MapPin size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '18px', fontWeight: '600' }}>
                {filterCategory ? 'Tidak ada laporan untuk kategori ini' : 'Belum ada laporan'}
              </p>
              <p>Mulai laporkan kerusakan jalan di sekitar Anda</p>
            </div>
          ) : (
            currentItems.map(lap => (
              <div
                key={lap.id}
                style={cardStyle(lap.id)}
                onMouseEnter={() => setHoveredCard(lap.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(lap)}
              >
                <div style={cardImageContainerStyle}>
                  <img
                    src={lap.photo.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo.split(/[\\/]/).pop()}`}
                    alt={lap.title}
                    style={cardImageStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(lap.photo.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo.split(/[\\/]/).pop()}`);
                    }}
                  />
                  <div style={clickHintStyle}>
                    <Navigation size={14} />
                    <span>Lihat di Peta</span>
                  </div>
                  <div style={cardOverlayStyle}>
                    <h3 style={cardTitleStyle}>{lap.title}</h3>
                    <div style={cardLocationStyle}>
                      <MapPin size={14} />
                      <span>{Number(lap.latitude).toFixed(4)}, {Number(lap.longitude).toFixed(4)}</span>
                    </div>
                  </div>

                  {/* "Milik Anda" Badge */}
                  {lap.pelapor?.nama === currentUserName && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: colors.primary,
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontSize: '10px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                    }}>
                      Milik Anda
                    </div>
                  )}
                </div>

                <div style={cardContentStyle}>
                  <p style={cardDescriptionStyle}>{lap.description}</p>
                  
                  {/* UC3 Vertical Timeline vs Static Text Status */}
                  {variant === 'A' ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginTop: '12px',
                      marginBottom: '12px',
                    }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Status Laporan:</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: (lap.status || '').toLowerCase() === 'selesai' ? '#34c759' : (lap.status || '').toLowerCase() === 'proses' ? '#007aff' : '#ff9500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {lap.status || 'Pending'}
                      </span>
                    </div>
                  ) : (
                    <VerticalTimeline status={lap.status} />
                  )}

                  <div style={{ ...cardMetaStyle, marginTop: '16px' }}>
                    <div style={cardMetaItemStyle}>
                      <User size={16} />
                      <span>{lap.pelapor?.nama || 'Anonymous'}</span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: (lap.priority === 'Darurat' || lap.damageSeverity === 'Berat' || lap.damageSeverity === 'Tinggi')
                        ? '#ef4444'
                        : (lap.priority === 'Tinggi' || lap.damageSeverity === 'Sedang')
                          ? '#f97316'
                          : '#3b82f6',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {lap.priority || lap.damageSeverity || 'Sedang'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredReports.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap', paddingBottom: '60px' }}>
            {/* Pages Label */}
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 'bold',
              fontSize: '14px',
              borderRadius: borderRadius.md,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              Halaman
            </div>

            {/* Previous */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                ...paginationButtonStyle(false),
                borderRadius: borderRadius.md,
                opacity: currentPage === 1 ? 0.3 : 1,
                cursor: currentPage === 1 ? 'default' : 'pointer'
              }}
            >
              «
            </button>

            {/* Page Numbers */}
            {(() => {
              const buttons = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) buttons.push(i);
              } else {
                if (currentPage <= 3) {
                  buttons.push(1, 2, 3, '...', totalPages);
                } else if (currentPage >= totalPages - 2) {
                  buttons.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                } else {
                  buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                }
              }

              return buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof btn === 'number' ? paginate(btn) : null}
                  disabled={btn === '...'}
                  style={{
                    ...paginationButtonStyle(currentPage === btn),
                    borderRadius: borderRadius.md,
                    cursor: btn === '...' ? 'default' : 'pointer'
                  }}
                >
                  {btn}
                </button>
              ));
            })()}

            {/* Next */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                ...paginationButtonStyle(false),
                borderRadius: borderRadius.md,
                opacity: currentPage === totalPages ? 0.3 : 1,
                cursor: currentPage === totalPages ? 'default' : 'pointer'
              }}
            >
              Berikutnya »
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {variant === 'B' && (
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

export default Dashboard;