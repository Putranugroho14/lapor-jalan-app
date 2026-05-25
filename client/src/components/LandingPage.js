import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Globe, Users, CheckCircle, MapPin } from 'lucide-react';
import { colors, buttons } from '../designSystem';
import landingBg from '../assets/yogyakarta-bg.png';
import config from '../config';

function LandingPage() {
    const token = localStorage.getItem('token');
    const [stats, setStats] = useState({
        users: 0,
        resolved: 0,
        regions: 1
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${config.apiUrl}/api/stats`);
                setStats({
                    users: res.data.userCount,
                    resolved: res.data.resolvedReportsCount,
                    regions: res.data.regionCount
                });
            } catch (err) {
                console.error("Failed to fetch stats", err);
                // Fallback stats
                setStats({ users: 1204, resolved: 845, regions: 1 });
            }
        };

        fetchStats();
    }, []);

    // --- Styles ---
    const containerStyle = {
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundImage: `url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: colors.white,
        padding: '0 20px',
        overflow: 'hidden',
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1,
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        maxWidth: '900px',
        animation: 'fadeInUp 1s ease-out',
    };

    const heroBadgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50px',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
    };

    const titleStyle = {
        fontSize: '64px',
        fontWeight: '800',
        lineHeight: '1.1',
        marginBottom: '24px',
        letterSpacing: '-1px',
        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
    };

    const subtitleStyle = {
        fontSize: '20px',
        fontWeight: '400',
        lineHeight: '1.6',
        maxWidth: '600px',
        margin: '0 auto 48px',
        color: 'rgba(255, 255, 255, 0.9)',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '80px',
    };

    const ctaButtonStyle = {
        ...buttons.primary,
        background: 'transparent',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        padding: '16px 48px',
        fontSize: '18px',
        borderRadius: '50px',
        backdropFilter: 'blur(5px)',
        transition: 'all 0.3s ease',
    };

    const statsContainerStyle = {
        display: 'flex',
        gap: '60px',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingBottom: '40px',
        borderTop: '1px solid rgba(255,255,255,0.2)',
        paddingTop: '40px',
        width: '100%',
        maxWidth: '800px',
    };

    const statItemStyle = {
        textAlign: 'left',
    };

    const statValueStyle = {
        fontSize: '28px',
        fontWeight: '700',
        display: 'block',
        marginBottom: '4px',
    };

    const statLabelStyle = {
        fontSize: '13px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    return (
        <>
            <style>
                {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .cta-hover:hover {
            background: rgba(255, 255, 255, 1) !important;
            color: #000 !important;
            transform: translateY(-4px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          }

          /* Responsive Styles */
          .landing-title {
            font-size: 64px;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 24px;
            letter-spacing: -1px;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }

          .landing-subtitle {
            font-size: 20px;
            font-weight: 400;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto 48px;
            color: #ffffff;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }

          .stats-container {
            display: flex;
            gap: 60px;
            justify-content: center;
            margin-top: auto;
            padding-bottom: 40px;
            border-top: 1px solid rgba(255,255,255,0.2);
            padding-top: 40px;
            width: 100%;
            max-width: 800px;
          }

          .stats-divider {
             width: 1px;
             height: 40px; 
             background: rgba(255,255,255,0.3);
          }

          @media (max-width: 768px) {
            .landing-title {
                font-size: 42px;
            }
            .landing-subtitle {
                font-size: 16px;
                padding: 0 16px;
                margin-bottom: 32px;
            }
            .stats-container {
                flex-direction: column;
                gap: 24px;
                align-items: center;
                padding-bottom: 80px; /* Space for scroll */
            }
            .stats-divider {
                display: none;
            }
            .hero-badge {
                font-size: 12px;
                padding: 6px 12px;
            }
          }

          @media (max-width: 480px) {
             .landing-title {
                font-size: 32px;
            }
          }
        `}
            </style>

            <div style={containerStyle}>
                <div style={overlayStyle} />

                {/* Helper dots overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    zIndex: 1,
                    opacity: 0.3
                }} />

                <div style={contentStyle}>
                    <div style={heroBadgeStyle} className="hero-badge">
                        Platform Pelaporan Publik
                    </div>

                    <h1 className="landing-title" style={{ color: '#fff' }}>
                        Lapor Kerusakan Jalan<br />
                        Di Yogyakarta
                    </h1>

                    <p className="landing-subtitle" style={{ color: '#fff' }}>
                        Ketemu jalan rusak? Laporkan sekarang! Karena keamanan berkendara di Yogyakarta adalah tanggung jawab kita bersama.
                        <span style={{
                            display: 'block',
                            marginTop: '24px',
                            fontWeight: '700',
                            fontSize: '1em',
                            color: '#fff',
                            letterSpacing: '0.5px'
                        }}>
                            Aduan Cepat, Perbaikan Tepat.<br />
                            Untuk Jogja yang Lebih Hebat.
                        </span>
                    </p>

                    <div style={buttonContainerStyle}>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <button style={ctaButtonStyle} className="cta-hover">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    Masuk Sekarang
                                    <ArrowRight size={20} />
                                </span>
                            </button>
                        </Link>
                    </div>

                    <div className="stats-container">
                        <div style={statItemStyle}>
                            <span style={statValueStyle}>{stats.users}</span>
                            <span style={statLabelStyle}><Users size={14} /> Warga Terdaftar</span>
                        </div>
                        <div className="stats-divider" />
                        <div style={statItemStyle}>
                            <span style={statValueStyle}>{stats.resolved}</span>
                            <span style={statLabelStyle}><CheckCircle size={14} /> Laporan Selesai</span>
                        </div>
                        <div className="stats-divider" />
                        <div style={statItemStyle}>
                            <span style={statValueStyle}>Yogyakarta</span>
                            <span style={statLabelStyle}><MapPin size={14} /> Wilayah Cakupan</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LandingPage;
