import axios from 'axios';

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (userData) => api.post('/auth/login', userData),
    getCurrentUser: () => api.get('/users/me'),
};

export const photoAPI = {
    uploadPhoto: (formData) =>
        axios.post(`${API_BASE_URL}/photos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
        }),
    getPhotos: (search) =>
        api.get('/photos', { params: { search } }),
    getPhoto: (photoId) => api.get(`/photos/${photoId}`),
    updatePhoto: (photoId, data) => api.put(`/photos/${photoId}`, data),
    deletePhoto: (photoId) => api.delete(`/photos/${photoId}`),
};

export const userAPI = {
    listUsers: () => api.get('/users'),
};

export const adminAPI = {
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    updateUserRole: (userId, role) =>
        api.post(`/admin/users/${userId}/role`, { role }),
};

export default api;