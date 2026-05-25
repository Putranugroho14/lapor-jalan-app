// Auto-detect API URL based on environment
const getApiUrl = () => {
    // In production (Vercel), API is on same domain
    if (process.env.NODE_ENV === 'production') {
        return window.location.origin;
    }
    // In development, use localhost
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();

export const config = {
    apiUrl: API_URL,
    apiEndpoints: {
        auth: {
            login: `${API_URL}/api/auth/login`,
            register: `${API_URL}/api/auth/register`,
        },
        reports: {
            create: `${API_URL}/api/reports`,
            getAll: `${API_URL}/api/reports`,
            updateStatus: (id) => `${API_URL}/api/reports/${id}/status`,
            delete: (id) => `${API_URL}/api/reports/${id}`,
        },
        uploads: `${API_URL}/uploads`,
    },
    uploads: `${API_URL}/uploads`,
};

export default config;
