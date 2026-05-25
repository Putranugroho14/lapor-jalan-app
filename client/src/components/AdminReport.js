import React, { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, MapPin, User, Calendar, Image, Trash2, Shield, Clock, AlertCircle, CheckCircle, AlertTriangle, Activity, Car, Truck, Bike, Footprints, Bus, LifeBuoy } from "lucide-react";
import { colors, borderRadius, shadows, transitions } from "../designSystem";
import config from "../config";
import { useAlert } from "./AlertContext";

function AdminReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { showAlert } = useAlert();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Admin table needs more space

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter States
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${config.apiUrl}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data.data);
    } catch (err) {
      showAlert("Gagal memuat laporan. Pastikan koneksi server aktif.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter & Sort Logic
  const filteredReports = reports
    .filter(report => {
      const reportDate = new Date(report.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (reportDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (reportDate > end) return false;
      }
      return true;
    })
    .sort((a, b) => {
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
  }, [startDate, endDate, sortBy]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleStatusChange = async (reportId, newStatus, newPriority) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${config.apiUrl}/api/reports/${reportId}/status`,
        { status: newStatus, priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(reports.map(r =>
        r.id === reportId ? { ...r, status: newStatus, priority: newPriority || r.priority } : r
      ));
      showAlert(`Status laporan berhasil diubah ke ${newStatus}.`, "success");
    } catch (err) {
      showAlert("Gagal mengubah status: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleDelete = async (reportId, reportTitle) => {
    if (!window.confirm(`⚠️ Hapus laporan: "${reportTitle}"?`)) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${config.apiUrl}/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(reports.filter(r => r.id !== reportId));
      showAlert(`Laporan "${reportTitle}" telah dihapus.`, "success");
    } catch (err) {
      showAlert("Gagal menghapus laporan. Silakan coba lagi.", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return colors.warning;
      case 'proses': return colors.info;
      case 'selesai': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Berat': return '#ef4444';
      case 'Sedang': return '#fbbf24';
      case 'Ringan': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'Sepeda Motor': return <Bike size={14} />;
      case 'Mobil Pribadi': return <Car size={14} />;
      case 'Angkutan Umum': return <Bus size={14} />;
      case 'Truk / Kendaraan Berat': return <Truck size={14} />;
      case 'Kendaraan Darurat': return <LifeBuoy size={14} />;
      case 'Pejalan Kaki': return <Footprints size={14} />;
      case 'Pesepeda': return <Bike size={14} />;
      default: return null;
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Darurat': return '#ef4444';
      case 'Tinggi': return '#f97316';
      case 'Sedang': return '#3b82f6';
      case 'Rendah': return '#10b981';
      default: return '#888';
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
    marginBottom: '48px',
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

  const filterRowStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: isMobile ? 'flex-start' : 'center',
    marginTop: '24px',
    flexWrap: 'wrap',
  };

  const inputStyle = {
    padding: '10px 16px',
    borderRadius: borderRadius.lg,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    outline: 'none',
    minWidth: '150px',
  };

  const tableContainerStyle = {
    ...darkGlassCard,
    padding: isMobile ? '12px' : '24px',
    overflowX: 'auto',
    background: isMobile ? 'transparent' : darkGlassCard.background,
    border: isMobile ? 'none' : darkGlassCard.border,
    boxShadow: isMobile ? 'none' : darkGlassCard.boxShadow,
    backdropFilter: isMobile ? 'none' : darkGlassCard.backdropFilter,
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    minWidth: '1100px',
  };

  const thStyle = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  };

  const tdStyle = {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  };

  return (
    <>
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
          }
          select option {
            background-color: #1a1a1a !important;
            color: #fff !important;
          }
          tr:hover td {
            background: rgba(255, 255, 255, 0.05) !important;
          }
        `}
      </style>

      {/* Image Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Size"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px' }}
          />
          <button
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer' }}
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
              <Shield size={40} color="#3b82f6" />
            </div>
          </div>
          <h1 style={titleStyle}>Admin Dashboard</h1>
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(to right, transparent, #3b82f6, transparent)',
            margin: '20px auto',
            borderRadius: '2px',
          }} />
          <p style={subtitleStyle}>Moderasi dan pemantauan infrastruktur jalan raya</p>
        </div>

        <div style={{ ...filterRowStyle, background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: borderRadius.xl, border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyle}>
              <option value="newest">📅 Terbaru</option>
              <option value="oldest">📅 Terlama</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: borderRadius.lg, border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>DARI:</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '6px 0', minWidth: '120px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: borderRadius.lg, border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>SAMPAI:</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '6px 0', minWidth: '120px' }} />
            </div>
            <button
              onClick={fetchReports}
              style={{
                padding: '10px 24px',
                borderRadius: borderRadius.lg,
                background: colors.primary,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>

      <div style={tableContainerStyle}>
        {currentItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>
            <MapPin size={60} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', fontWeight: '600' }}>Tidak ada data laporan ditemukan</p>
          </div>
        ) : (
          <>
            {!isMobile ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Foto</th>
                    <th style={thStyle}>Laporan & Detail</th>
                    <th style={thStyle}>Status Kerja</th>
                    <th style={thStyle}>Prioritas</th>
                    <th style={thStyle}>Lokasi</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((lap) => (
                    <tr key={lap.id}>
                      <td style={{ ...tdStyle, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                        <img
                          src={lap.photo?.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo?.split(/[\\/]/).pop()}`}
                          alt="Bukti"
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                          onClick={() => setSelectedImage(lap.photo?.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo?.split(/[\\/]/).pop()}`)}
                        />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: '#fff' }}>{lap.damageType || lap.title}</div>
                          {lap.damageSeverity && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              background: `${getSeverityColor(lap.damageSeverity)}20`,
                              color: getSeverityColor(lap.damageSeverity),
                              border: `1px solid ${getSeverityColor(lap.damageSeverity)}40`,
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {lap.damageSeverity}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                          {lap.description}
                        </div>

                        {/* Impact & Vehicles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                          {lap.trafficImpact && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fda4af' }}>
                              <AlertTriangle size={14} />
                              <span>Impact: {lap.trafficImpact}</span>
                            </div>
                          )}

                          {(() => {
                            const vehicles = parseImpactedVehicles(lap.impactedVehicles);
                            if (vehicles.length === 0) return null;
                            return (
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {vehicles.map((v, idx) => (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    color: '#ccc',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                  }}>
                                    {getVehicleIcon(v)}
                                    <span>{v}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#666', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} />{lap.pelapor?.nama || 'Anonim'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />{new Date(lap.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={lap.status}
                          onChange={(e) => handleStatusChange(lap.id, e.target.value, lap.priority)}
                          style={{ ...inputStyle, padding: '6px 12px', minWidth: '120px', borderColor: `${getStatusColor(lap.status)}40`, color: getStatusColor(lap.status) }}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Proses">🔧 Proses</option>
                          <option value="Selesai">✅ Selesai</option>
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={lap.priority || 'Sedang'}
                          onChange={(e) => handleStatusChange(lap.id, lap.status, e.target.value)}
                          style={{
                            ...inputStyle,
                            padding: '6px 12px',
                            minWidth: '120px',
                            borderColor: `${getPriorityColor(lap.priority || 'Sedang')}40`,
                            color: getPriorityColor(lap.priority || 'Sedang'),
                            fontWeight: 'bold'
                          }}
                        >
                          <option value="Rendah">🟢 Rendah</option>
                          <option value="Sedang">🔵 Sedang</option>
                          <option value="Tinggi">🟠 Tinggi</option>
                          <option value="Darurat">🔴 Darurat</option>
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <a
                          href={`https://www.google.com/maps?q=${lap.latitude},${lap.longitude}`}
                          target="_blank" rel="noreferrer"
                          style={{ color: colors.primary, textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                        >
                          <MapPin size={16} /> Peta
                        </a>
                      </td>
                      <td style={{ ...tdStyle, borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <button
                          onClick={() => handleDelete(lap.id, lap.title)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Mobile Card View
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentItems.map((lap) => (
                  <div key={lap.id} style={{ ...darkGlassCard, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <img
                        src={lap.photo?.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo?.split(/[\\/]/).pop()}`}
                        alt="Bukti"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                        onClick={() => setSelectedImage(lap.photo?.startsWith('http') ? lap.photo : `${config.uploads}/${lap.photo?.split(/[\\/]/).pop()}`)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#fff' }}>{lap.damageType || lap.title}</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: `${getSeverityColor(lap.damageSeverity)}20`, color: getSeverityColor(lap.damageSeverity), border: `1px solid ${getSeverityColor(lap.damageSeverity)}40`, fontWeight: 'bold' }}>{lap.damageSeverity}</span>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: `${getStatusColor(lap.status)}20`, color: getStatusColor(lap.status), border: `1px solid ${getStatusColor(lap.status)}40`, fontWeight: 'bold' }}>{lap.status?.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.4' }}>{lap.description}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>STATUS</span>
                        <select
                          value={lap.status}
                          onChange={(e) => handleStatusChange(lap.id, e.target.value, lap.priority)}
                          style={{ ...inputStyle, padding: '6px', fontSize: '11px', minWidth: '0', width: '100%', background: 'rgba(255,255,255,0.1)' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="proses">Proses</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>PRIORITAS</span>
                        <select
                          value={lap.priority || ""}
                          onChange={(e) => handleStatusChange(lap.id, lap.status, e.target.value)}
                          style={{
                            ...inputStyle, padding: '6px', fontSize: '11px', minWidth: '0', width: '100%', fontWeight: '700', color: getPriorityColor(lap.priority),
                            border: `1px solid ${getPriorityColor(lap.priority)}50`, background: `${getPriorityColor(lap.priority)}10`
                          }}
                        >
                          <option value="">-- Prioritas --</option>
                          <option value="Darurat">🔴 DARURAT</option>
                          <option value="Tinggi">🟠 TINGGI</option>
                          <option value="Sedang">🔵 SEDANG</option>
                          <option value="Rendah">🟢 RENDAH</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                      <a
                        href={`https://www.google.com/maps?q=${lap.latitude},${lap.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MapPin size={12} /> Peta
                      </a>
                      <button
                        onClick={() => handleDelete(lap.id, lap.title)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', fontSize: '11px' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredReports.length > itemsPerPage && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
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
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: borderRadius.md,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: currentPage === 1 ? 'default' : 'pointer',
                    fontSize: '14px',
                    opacity: currentPage === 1 ? 0.3 : 1,
                    outline: 'none',
                    fontWeight: 'bold'
                  }}
                >«</button>

                {(() => {
                  const btns = [];
                  if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) btns.push(i);
                  else {
                    if (currentPage <= 3) btns.push(1, 2, 3, '...', totalPages);
                    else if (currentPage >= totalPages - 2) btns.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                    else btns.push(1, '...', currentPage, '...', totalPages);
                  }
                  return btns.map((b, i) => (
                    <button
                      key={i} onClick={() => typeof b === 'number' && paginate(b)}
                      disabled={b === '...'}
                      style={{
                        padding: '8px 16px',
                        borderRadius: borderRadius.md,
                        border: `1px solid ${currentPage === b ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                        background: currentPage === b ? colors.primary : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        cursor: b === '...' ? 'default' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        outline: 'none'
                      }}
                    >{b}</button>
                  ));
                })()}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: borderRadius.md,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: currentPage === totalPages ? 'default' : 'pointer',
                    fontSize: '14px',
                    opacity: currentPage === totalPages ? 0.3 : 1,
                    outline: 'none',
                    fontWeight: 'bold'
                  }}
                >Berikutnya »</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default AdminReport;