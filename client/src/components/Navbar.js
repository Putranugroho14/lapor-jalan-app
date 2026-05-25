import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Clock, Shield, LogOut, LogIn, UserPlus, Plus } from 'lucide-react';
import { colors, glass, borderRadius, shadows, transitions } from '../designSystem';
import { useABVariant } from '../utils/abTesting';

function Navbar() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const variant = useABVariant();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (location.pathname === '/') {
    return null;
  }

  const navbarStyle = {
    position: 'fixed',
    top: isMobile ? '10px' : '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: 'rgba(23, 23, 23, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '100px',
    padding: '6px 6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    minWidth: isMobile ? '95%' : '320px',
    width: isMobile ? '95%' : 'auto',
    justifyContent: 'space-between',
  };

  const logoContainerStyle = {
    marginLeft: isMobile ? '12px' : '16px',
    marginRight: isMobile ? '8px' : '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const logoTextStyle = {
    fontSize: isMobile ? '16px' : '20px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
    display: isMobile && token ? 'none' : 'block', // Hide text logo on small mobile if logged in to save space
  };

  const navItemStyle = (isActive, itemKey) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: isMobile ? '10px 12px' : '10px 20px',
    borderRadius: '100px',
    textDecoration: 'none',
    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
    fontWeight: isActive ? '600' : '500',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    background: isActive
      ? 'linear-gradient(to right, #2563eb, #3b82f6)'
      : hoveredItem === itemKey
        ? 'rgba(255, 255, 255, 0.05)'
        : 'transparent',
    boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none',
  });

  const iconStyle = (isActive, itemKey) => ({
    transition: 'transform 0.2s',
    transform: hoveredItem === itemKey || isActive ? 'scale(1.1)' : 'scale(1)',
    color: isActive ? '#fff' : 'currentColor', // Inherit color
  });

  const buttonStyle = (itemKey) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '100px',
    border: '1px solid rgba(255,59,48,0.3)',
    background: hoveredItem === itemKey
      ? 'rgba(255, 59, 48, 0.2)'
      : 'transparent',
    color: '#ff4d4f',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  });

  const adminBadgeStyle = (itemKey) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: isMobile ? '10px 12px' : '10px 20px',
    borderRadius: '100px',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  });

  const dividerStyle = {
    width: '1px',
    height: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0 2px',
    display: isMobile ? 'none' : 'block',
  };

  return (
    <nav style={navbarStyle}>
      <div style={logoContainerStyle}>
        <span style={{ fontSize: '20px' }}>🚧</span>
        <span style={logoTextStyle}>LaporJalan</span>
      </div>

      {token ? (
        <>


          <Link
            to="/dashboard"
            style={navItemStyle(location.pathname === '/dashboard', 'dashboard')}
            onMouseEnter={() => setHoveredItem('dashboard')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Home size={18} style={iconStyle(location.pathname === '/dashboard', 'dashboard')} />
            {!isMobile && <span>Beranda</span>}
          </Link>

          {variant === 'A' && role !== 'admin' && (
            <Link
              to="/lapor"
              style={navItemStyle(location.pathname === '/lapor', 'lapor')}
              onMouseEnter={() => setHoveredItem('lapor')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Plus size={18} style={iconStyle(location.pathname === '/lapor', 'lapor')} />
              {!isMobile && <span>Lapor</span>}
            </Link>
          )}

          <Link
            to="/peta"
            style={navItemStyle(location.pathname === '/peta', 'peta')}
            onMouseEnter={() => setHoveredItem('peta')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Map size={18} style={iconStyle(location.pathname === '/peta', 'peta')} />
            {!isMobile && <span>Peta</span>}
          </Link>

          <Link
            to="/riwayat"
            style={navItemStyle(location.pathname === '/riwayat', 'riwayat')}
            onMouseEnter={() => setHoveredItem('riwayat')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Clock size={18} style={iconStyle(location.pathname === '/riwayat', 'riwayat')} />
            {!isMobile && <span>Riwayat</span>}
          </Link>

          {role === 'admin' && (
            <>
              <div style={dividerStyle} />
              <Link
                to="/admin"
                style={adminBadgeStyle('admin')}
                onMouseEnter={() => setHoveredItem('admin')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Shield size={18} />
                {!isMobile && <span>Admin</span>}
              </Link>
            </>
          )}

          <div style={dividerStyle} />

          <button
            onClick={handleLogout}
            style={{ ...buttonStyle('logout'), padding: isMobile ? '10px 12px' : '10px 20px' }}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <LogOut size={18} />
            {!isMobile && <span>Logout</span>}
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            style={navItemStyle(location.pathname === '/login', 'login')}
            onMouseEnter={() => setHoveredItem('login')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <LogIn size={18} style={iconStyle(location.pathname === '/login', 'login')} />
            {!isMobile && <span>Login</span>}
          </Link>

          <Link
            to="/register"
            style={navItemStyle(location.pathname === '/register', 'register')}
            onMouseEnter={() => setHoveredItem('register')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <UserPlus size={18} style={iconStyle(location.pathname === '/register', 'register')} />
            {!isMobile && <span>Register</span>}
          </Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;