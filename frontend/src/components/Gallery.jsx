import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { photoAPI } from '../api';
import PhotoCard from './PhotoCard';
import UploadModal from './UploadModal';
import AdminPanel from './AdminPanel';
import '../styles/Gallery.css';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPhotos();
  }, [user, navigate]);

  const fetchPhotos = async (search = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await photoAPI.getPhotos(search);
      setPhotos(response.data);
    } catch (err) {
      setError('Không thể tải danh sách ảnh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchPhotos(term);
  };

  const handlePhotoDeleted = (photoId) => {
    setPhotos(photos.filter((photo) => photo.id !== photoId));
  };

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos([newPhoto, ...photos]);
    setShowUploadModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <h1>Gallery Application</h1>
        <div className="header-actions">
          <div className="user-info">
            <span>Xin chào, {user?.username}</span>
            {user?.role === 'admin' && <span className="admin-badge">Admin</span>}
          </div>
          <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
            + Tải ảnh lên
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="gallery-search">
        <input
          type="text"
          placeholder="Tìm kiếm ảnh theo tên..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {user?.role === 'admin' && <AdminPanel currentUser={user} />}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có ảnh nào. {' '}
            <button 
              className="link-button" 
              onClick={() => setShowUploadModal(true)}
            >
              Tải lên ảnh đầu tiên của bạn
            </button>
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onDeleted={handlePhotoDeleted}
            />
          ))}
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onPhotoUploaded={handlePhotoUploaded}
        />
      )}
    </div>
  );
}
