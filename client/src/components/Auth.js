import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Map, AlertCircle } from "lucide-react";
import designSystem, { colors } from "../designSystem";
import config from "../config";
import { useAlert } from "./AlertContext";

function Auth() {
    const [isLoginActive, setIsLoginActive] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize mode based on URL
    useEffect(() => {
        if (location.pathname === "/register") {
            setIsLoginActive(false);
        } else {
            setIsLoginActive(true);
        }
    }, [location.pathname]);

    const toggleMode = () => {
        if (isLoginActive) {
            navigate("/register");
        } else {
            navigate("/login");
        }
    };

    // --- Form States ---
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [regForm, setRegForm] = useState({ nama: "", email: "", password: "" });

    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // --- Handlers ---

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post(`${config.apiUrl}/api/auth/login`, { email: loginEmail, password: loginPassword });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("nama", res.data.nama);
            showAlert(`Selamat datang kembali, ${res.data.nama}!`, 'success');
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 500);
        } catch (err) {
            showAlert(err.response?.data?.message || "Login gagal. Silakan coba lagi.", 'error');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${config.apiUrl}/api/auth/register`, regForm);
            showAlert("✅ Registrasi Berhasil! Silakan masuk.", 'success');
            // Switch to login mode automatically
            navigate("/login");
            setRegForm({ nama: "", email: "", password: "" }); // Reset form
            setIsLoading(false);
        } catch (err) {
            showAlert(err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.", 'error');
            setIsLoading(false);
        }
    };

    // --- Styles ---

    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: colors.gradientDarkAnimated,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',
    };

    const containerStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: isMobile ? '15px' : '30px',
        boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        position: 'relative',
        overflow: 'hidden',
        width: isMobile ? '100%' : '900px',
        maxWidth: '100%',
        minHeight: isMobile ? '500px' : '600px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
    };

    // Form Container (Shared)
    const formContainerBase = {
        position: isMobile ? 'relative' : 'absolute',
        top: 0,
        height: '100%',
        transition: 'all 0.6s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '40px 20px' : '0 50px',
        textAlign: 'center',
        width: isMobile ? '100%' : '50%',
    };

    const loginContainerStyle = {
        ...formContainerBase,
        left: 0,
        zIndex: 2,
        opacity: isLoginActive ? 1 : 0,
        transform: isLoginActive ? 'translateX(0)' : 'translateX(100%)', // Effect when inactive
    };

    const registerContainerStyle = {
        ...formContainerBase,
        left: 0,
        width: '50%',
        zIndex: 1,
        opacity: isLoginActive ? 0 : 1, // Hidden when login active
        transform: isLoginActive ? 'translateX(0)' : 'translateX(100%)', // Move to right slot when active (but overlay covers left) - wait, standard logic is shifting.
        // Let's use standard sliding panel logic:
        // Register is usually on the "left" physically but covered, or right.
        // Let's place Register on Left (z=1), Login on Right (z=2).
        // Actually, common pattern: Both are 50% width.
        // Sign Up form is on Left. Sign In form is on Right.
        // Overlay slides over one of them.

        // Adjusted Logic for "Sign Up (Left) / Sign In (Right)" structure:
        // If isLoginActive (Show Sign In): Overlay is on Left (covering Sign Up), Form is on Right.
        // If !isLoginActive (Show Sign Up): Overlay is on Right (covering Sign In), Form is on Left.

        // Wait, simpler approach for "One Page":
        // Two forms side by side? Or overlay covering one?
        // Let's stick to the Pinterest style: Split screen.
        // Left Half: Register Form. Right Half: Login Form.
        // Overlay moves to cover the one NOT in use?
        // No, usually Overlay contains the "Welcome" message and calls to action.
        // Forms are in the background layers.
    };

    // Re-defining styles for standard "Sliding Overlay" pattern
    // Sign Up Container (Left side base)
    const userSignUpStyle = {
        ...formContainerBase,
        left: 0,
        width: '50%',
        opacity: isLoginActive ? 0 : 1,
        zIndex: isLoginActive ? 1 : 5,
        transform: isLoginActive ? 'translateX(0)' : 'translateX(100%)', // This moves it to the right? No.
        // Correct Logic:
        // Sign In Container: Left: 0, Width: 50%, Z: 2.
        // Sign Up Container: Left: 0, Width: 50%, Z: 1. Opacity 0.
        // Transition: When Active (Sign Up), it moves to 100% (Right)? No.
    };

    // Let's use the standard "Right Panel Active" class logic translated to inline styles.
    // "Sign In" is default.
    // Structure: 
    // [Sign Up Form (Left)] [Sign In Form (Right)] <- Logic
    // Actually, let's put:
    // Login Form on LEFT. Overlay on RIGHT.
    // Click "Sign Up" -> Overlay slides LEFT, exposing Register Form on RIGHT.
    // This is the classic behavior.

    // Container 1: Login Form (Left side)
    const signInContainerStyle = {
        ...formContainerBase,
        left: 0,
        width: '50%',
        zIndex: 2,
        opacity: isLoginActive ? 1 : 0,
        transform: isLoginActive ? 'translateX(0)' : 'translateX(100%)', // If not login, move out?
        // Actually, standard is: Login is always at Left. Register is always at Left (behind) or Right.
        // Let's place them:
        // Login @ Left 0.
        // Register @ Left 0 (but z-index low).
        // Animation: When switching to Register, Register moves to Right (100%), Z-index up.

        // SIMPLIFIED APPROACH:
        // Form Container: Width 50%.
        // Login Form: Left 0.
        // Register Form: Left 0. opacity 0.
        // Overlay: Width 50%. Right 0.

        // Let's try this specific "Move Overlay" logic:
        // Overlay is defaults on RIGHT. (Covering the empty space? or covering the other form?)
        // This is confusing without CSS classes. I will implement independent separate containers side-by-side
        // and just slide the overlay.
    };

    // --- REVISED LAYOUT PLAN ---
    // Left 50%: Register Form
    // Right 50%: Login Form
    // Overlay: Covers one half.
    // Default (Login Mode): Overlay covers Left (Register). Login visible on Right.
    // Switch (Register Mode): Overlay covers Right (Login). Register visible on Left.

    const formSectionStyle = {
        position: 'absolute',
        top: 0,
        height: '100%',
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        transition: 'all 0.6s ease-in-out',
    };

    const registerFormStyle = {
        ...formSectionStyle,
        left: isMobile ? 0 : 'auto',
        right: 0,
        width: isMobile ? '100%' : '50%',
        opacity: !isLoginActive ? 1 : (isMobile ? 0 : 0),
        zIndex: !isLoginActive ? 5 : (isMobile ? -1 : 1),
        display: isMobile && isLoginActive ? 'none' : 'flex',
    };

    const loginFormStyle = {
        ...formSectionStyle,
        left: isMobile ? 0 : 0,
        width: isMobile ? '100%' : '50%',
        opacity: isLoginActive ? 1 : (isMobile ? 0 : 0),
        zIndex: isLoginActive ? 5 : (isMobile ? -1 : 1),
        display: isMobile && !isLoginActive ? 'none' : 'flex',
    };

    // --- Refined Styles ---

    const overlayContainerStyle = {
        position: isMobile ? 'relative' : 'absolute',
        top: isMobile ? 'auto' : 0,
        bottom: isMobile ? 0 : 'auto',
        left: isMobile ? 0 : '50%',
        width: isMobile ? '100%' : '50%',
        height: isMobile ? 'auto' : '100%',
        overflow: 'hidden',
        transition: 'transform 0.6s ease-in-out',
        zIndex: 100,
        transform: isMobile ? 'none' : (isLoginActive ? 'translateX(0)' : 'translateX(-100%)'),
        borderRadius: isMobile ? '0' : (isLoginActive ? '0 30px 30px 0' : '30px 0 0 30px'),
    };

    const overlayStyle = {
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // More vibrant blue gradient
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: '0 0',
        color: '#FFFFFF',
        position: 'relative',
        left: isMobile ? 0 : '-100%',
        height: isMobile ? 'auto' : '100%',
        width: isMobile ? '100%' : '200%',
        transform: isMobile ? 'none' : (isLoginActive ? 'translateX(0)' : 'translateX(50%)'),
        transition: 'transform 0.6s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const inputGroupStyle = {
        position: 'relative',
        width: '100%',
        margin: '10px 0',
    };

    const inputIconStyle = {
        position: 'absolute',
        left: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(255,255,255,0.6)',
    };

    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 16px 16px 50px', // Added padding left for icon
        width: '100%',
        borderRadius: '12px',
        color: '#fff',
        outline: 'none',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    };

    const buttonStyle = {
        borderRadius: '25px',
        border: 'none',
        background: 'linear-gradient(to right, #3b82f6, #2563eb)', // Premium Blue Gradient
        fontSize: '14px',
        fontWeight: '700',
        padding: '14px 45px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        transition: 'transform 80ms ease-in',
        cursor: 'pointer',
        marginTop: '24px',
        width: '100%',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
        color: '#fff',
    };

    const ghostButtonStyle = {
        borderRadius: '25px',
        border: '1px solid rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(5px)',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: '700',
        padding: '12px 45px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        marginTop: '20px',
    };

    const overlayPanelStyleBase = {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 40px',
        textAlign: 'center',
        top: 0,
        height: '100%',
        width: '50%',
        transform: 'translateX(0)',
        transition: 'transform 0.6s ease-in-out',
    };

    // When Overlay is at Right (Login Active): We see the Left Panel of the Overlay Wrapper?
    // Wrapper is 200%. Overlay is at -100% Left.
    // Transform 0: We see the Right half of the 200% width?
    // Let's test visually. Usually:
    // Left Panel: translateX(0). Right Panel: translateX(20%).

    // Overlay Left Content (Visible when Overlay is Left -> Register Active? No.
    // When Overlay is Left (Register Active), it covers Login (Left).
    // Content: "Sudah Punya Akun?" (Login Prompt).
    const overlayLeftStyle = {
        ...overlayPanelStyleBase,
        transform: isMobile ? 'none' : (isLoginActive ? 'translateX(-20%)' : 'translateX(0)'),
        left: 0,
        display: isMobile ? (!isLoginActive ? 'none' : 'flex') : 'flex',
        width: isMobile ? '100%' : '50%',
        padding: isMobile ? '30px 20px' : '0 40px',
    };

    // Overlay Right Content (Visible when Overlay is Right -> Login Active)
    // When Overlay is Right (Login Active), it covers Register (Right).
    // Content: "Halo Teman!" (Register Prompt).
    const overlayRightStyle = {
        ...overlayPanelStyleBase,
        transform: isMobile ? 'none' : (isLoginActive ? 'translateX(0)' : 'translateX(20%)'),
        right: 0,
        display: isMobile ? (isLoginActive ? 'none' : 'flex') : 'flex',
        width: isMobile ? '100%' : '50%',
        padding: isMobile ? '30px 20px' : '0 40px',
    };

    // --- Components ---

    const titleStyle = {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#fff',
    };

    const pStyle = {
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0.5px',
        margin: '20px 0 30px',
        color: 'rgba(255,255,255,0.8)',
    };

    // Map Icon Header
    const iconHeaderStyle = {
        display: 'inline-flex',
        padding: '16px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '24px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)',
    };

    return (
        <div style={pageStyle}>
            <style>{designSystem.animations.gradientShift}</style>
            <style>
                {`
          input::placeholder { color: rgba(255,255,255,0.4); }
          input:focus { 
            background: rgba(255,255,255,0.1); 
            border-color: rgba(60, 130, 246, 0.5); 
          }
        `}
            </style>

            <div style={containerStyle}>

                {/* REGISTER FORM */}
                <div style={registerFormStyle}>
                    <div style={iconHeaderStyle}>
                        <Map size={32} color="#fff" />
                    </div>
                    <h1 style={titleStyle}>Buat Akun</h1>

                    <form onSubmit={handleRegister} style={{ width: '100%' }}>
                        <div style={inputGroupStyle}>
                            <User size={18} style={inputIconStyle} />
                            <input
                                type="text"
                                placeholder="Nama Lengkap"
                                style={inputStyle}
                                value={regForm.nama}
                                onChange={(e) => setRegForm({ ...regForm, nama: e.target.value })}
                                required
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <Mail size={18} style={inputIconStyle} />
                            <input
                                type="email"
                                placeholder="Email"
                                style={inputStyle}
                                value={regForm.email}
                                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <Lock size={18} style={inputIconStyle} />
                            <input
                                type="password"
                                placeholder="Password"
                                style={inputStyle}
                                value={regForm.password}
                                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" style={buttonStyle}>
                            {isLoading ? "Memproses..." : "Daftar"}
                        </button>
                    </form>
                </div>

                {/* LOGIN FORM */}
                <div style={loginFormStyle}>
                    <div style={iconHeaderStyle}>
                        <Map size={32} color="#fff" />
                    </div>
                    <h1 style={titleStyle}>Masuk</h1>

                    <form onSubmit={handleLogin} style={{ width: '100%' }}>
                        <div style={inputGroupStyle}>
                            <Mail size={18} style={inputIconStyle} />
                            <input
                                type="email"
                                placeholder="Email"
                                style={inputStyle}
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <Lock size={18} style={inputIconStyle} />
                            <input
                                type="password"
                                placeholder="Password"
                                style={inputStyle}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" style={buttonStyle}>
                            {isLoading ? "Memproses..." : "Masuk"}
                        </button>
                    </form>
                </div>

                {/* OVERLAY CONTAINER */}
                <div style={overlayContainerStyle}>
                    <div style={overlayStyle}>

                        <div style={overlayLeftStyle}>
                            <h1 style={titleStyle}>Sudah Punya Akun?</h1>
                            <p style={pStyle}>
                                Silakan login dengan akun Anda.
                            </p>
                            <button style={ghostButtonStyle} onClick={toggleMode}>
                                Masuk
                            </button>
                        </div>

                        <div style={overlayRightStyle}>
                            <h1 style={titleStyle}>Halo, Teman!</h1>
                            <p style={pStyle}>
                                Daftar sekarang untuk mulai melapor.
                            </p>
                            <button style={ghostButtonStyle} onClick={toggleMode}>
                                Daftar
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Auth;
