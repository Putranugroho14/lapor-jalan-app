import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Map } from "lucide-react";
import { colors } from "../designSystem";
import config from "../config";

function Register() {
  const [form, setForm] = useState({ nama: "", email: "", password: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReg = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${config.apiUrl}/api/auth/register`, form);
      // Show success and redirect
      alert("✅ Registrasi Berhasil! Silakan login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: colors.gradientDarkAnimated,
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    position: 'relative',
  };



  const cardStyle = {
    maxWidth: '440px',
    width: '100%',
    padding: '48px',
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  };

  const subtitleStyle = {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    lineHeight: '1.5',
  };

  const formGroupStyle = {
    marginBottom: '24px',
    position: 'relative',
  };

  const iconStyle = {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.6)',
    zIndex: 2,
    pointerEvents: 'none',
  };

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '16px 16px 16px 52px',
    fontSize: '16px',
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.1)',
    border: focusedField === fieldName ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s ease',
  });

  const submitButtonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '24px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    background: colors.primary,
    border: 'none',
    borderRadius: '12px',
    cursor: isLoading ? 'wait' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: isLoading ? 0.7 : 1,
  };

  const errorStyle = {
    background: 'rgba(220, 38, 38, 0.2)',
    border: '1px solid rgba(220, 38, 38, 0.5)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#ffcaca',
    fontSize: '14px',
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '32px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '4px',
  };

  return (
    <>
      <style>
        {`
          input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }
        `}
      </style>

      <div style={containerStyle}>


        <div style={cardStyle}>
          <div style={headerStyle}>
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              marginBottom: '24px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Map size={40} color="#fff" />
            </div>
            <h2 style={titleStyle}>Buat Akun Baru</h2>
            <p style={subtitleStyle}>Bergabung dengan LaporJalan</p>
          </div>

          {error && (
            <div style={errorStyle}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleReg}>
            <div style={formGroupStyle}>
              <div style={iconStyle}>
                <User size={20} />
              </div>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                onFocus={() => setFocusedField('nama')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="Nama Lengkap"
                style={inputStyle('nama')}
              />
            </div>

            <div style={formGroupStyle}>
              <div style={iconStyle}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="Email Address"
                style={inputStyle('email')}
              />
            </div>

            <div style={formGroupStyle}>
              <div style={iconStyle}>
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="Password (Min. 6 chars)"
                style={inputStyle('password')}
              />
            </div>

            <button
              type="submit"
              style={submitButtonStyle}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Memproses...' : 'Daftar Sekarang'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div style={footerStyle}>
            Sudah punya akun?
            <Link to="/login" style={linkStyle}>
              Masuk sekarang
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;