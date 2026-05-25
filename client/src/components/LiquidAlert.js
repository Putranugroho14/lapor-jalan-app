import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { colors, borderRadius, shadows, transitions } from '../designSystem';

const LiquidAlert = ({ message, type = 'info', onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 4500); // Start exit animation slightly before auto-remove
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400); // Match animation duration
    };

    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle size={20} />,
                    color: colors.success,
                    bg: 'rgba(52, 199, 89, 0.1)',
                    border: 'rgba(52, 199, 89, 0.2)',
                    shadow: 'rgba(52, 199, 89, 0.3)',
                };
            case 'error':
                return {
                    icon: <AlertCircle size={20} />,
                    color: colors.danger,
                    bg: 'rgba(255, 59, 48, 0.1)',
                    border: 'rgba(255, 59, 48, 0.2)',
                    shadow: 'rgba(255, 59, 48, 0.3)',
                };
            default:
                return {
                    icon: <Info size={20} />,
                    color: colors.primary,
                    bg: 'rgba(0, 122, 255, 0.1)',
                    border: 'rgba(0, 122, 255, 0.2)',
                    shadow: 'rgba(0, 122, 255, 0.3)',
                };
        }
    };

    const config = getConfig();

    return (
        <div style={{
            minWidth: '320px',
            maxWidth: '450px',
            background: 'rgba(15, 23, 42, 0.8)', // Deep Dark Slate
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${config.border}`,
            borderRadius: '16px',
            padding: '16px',
            boxShadow: `0 10px 40px -10px ${config.shadow}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
            animation: isExiting ? 'liquidAlertOut 0.4s cubic-bezier(0.4, 0, 1, 1) forwards' : 'liquidAlertIn 0.5s cubic-bezier(0, 0, 0.2, 1) forwards',
            pointerEvents: 'auto',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <style>
                {`
          @keyframes liquidAlertIn {
            from { transform: translateX(100%) scale(0.9); opacity: 0; }
            to { transform: translateX(0) scale(1); opacity: 1; }
          }
          @keyframes liquidAlertOut {
            from { transform: translateX(0) scale(1); opacity: 1; }
            to { transform: translateX(120%) scale(0.9); opacity: 0; }
          }
        `}
            </style>

            {/* Accent Line */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '4px',
                background: config.color,
                boxShadow: `0 0 10px ${config.color}`,
            }} />

            <div style={{ color: config.color }}>
                {config.icon}
            </div>

            <div style={{ flex: 1, fontSize: '14px', fontWeight: '500', lineHeight: '1.4' }}>
                {message}
            </div>

            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.4)'}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default LiquidAlert;
