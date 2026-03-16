import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);

// Admin
export const getDashboard = () => api.get('/admin/dashboard');
export const getVehicles = () => api.get('/admin/vehicles');
export const getDeliveries = () => api.get('/admin/deliveries');
export const getDrivers = () => api.get('/admin/drivers');
export const getTracking = () => api.get('/admin/tracking');
export const createVehicle = (data) => api.post('/admin/vehicles', data);
export const createDelivery = (data) => api.post('/admin/deliveries', data);
export const updateDelivery = (id, data) => api.put(`/admin/deliveries/${id}`, data);
export const deleteDelivery = (id) => api.delete(`/admin/deliveries/${id}`);
export const getDeliveryStats = () => api.get('/admin/deliveries/stats');
export const updateDriver = (id, data) => api.put(`/admin/drivers/${id}`, data);
export const deleteDriver = (id) => api.delete(`/admin/drivers/${id}`);
export const deleteVehicle = (id) => api.delete(`/admin/vehicles/${id}`);
export const updateVehicle = (id, data) => api.put(`/admin/vehicles/${id}`, data);

// Driver role
export const getMyDeliveries = () => api.get('/driver/deliveries');
export const updateDeliveryStatus = (id, status) => api.put(`/driver/deliveries/${id}/status`, { status });

// Analytics
export const getAnalytics = () => api.get('/admin/analytics');

// Single delivery
export const getDelivery = (id) => api.get(`/admin/deliveries/${id}`);
export const uploadPOD = (id, formData) => api.post(`/deliveries/${id}/pod`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadSignature = (id, signature) => api.post(`/deliveries/${id}/signature`, { signature });

export default api;
