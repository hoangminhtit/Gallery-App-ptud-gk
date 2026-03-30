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
    login: (userData) => {
        const role = userData.role === 'admin' ? 'admin' : 'user';
        return api.post(`/auth/login/${role}`, userData);
    },
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
    uploadPhotosBatch: (formData) =>
        axios.post(`${API_BASE_URL}/photos/batch`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
        }),
    uploadPhotoFromUrl: (payload) => api.post('/photos/from-url', payload),
    getPhotos: (params) =>
        api.get('/photos', { params }),
    getPhoto: (photoId) => api.get(`/photos/${photoId}`),
    updatePhoto: (photoId, data) => api.put(`/photos/${photoId}`, data),
    deletePhoto: (photoId) => api.delete(`/photos/${photoId}`),
    restorePhoto: (photoId) => api.post(`/photos/${photoId}/restore`),
    setFavorite: (photoId, isFavorite) =>
        api.put(`/photos/${photoId}/favorite`, { is_favorite: isFavorite }),
    downloadPhoto: (photoId, includeDeleted = false) =>
        api.get(`/photos/${photoId}/download`, {
            params: includeDeleted ? { include_deleted: true } : undefined,
            responseType: 'blob',
        }),
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