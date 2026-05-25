import React, { createContext, useState, useContext, useCallback } from 'react';
import LiquidAlert from './LiquidAlert';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const showAlert = useCallback((message, type = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setAlerts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, duration);
    }, []);

    const removeAlert = useCallback((id) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none',
            }}>
                {alerts.map((alert) => (
                    <LiquidAlert
                        key={alert.id}
                        message={alert.message}
                        type={alert.type}
                        onClose={() => removeAlert(alert.id)}
                    />
                ))}
            </div>
        </AlertContext.Provider>
    );
};
