import React, { useState } from 'react';
import { photoAPI, API_BASE_URL } from '../api';
import PhotoDetailModal from './PhotoDetailModal';
import '../styles/PhotoCard.css';

export default function PhotoCard({ photo, onDeleted }) {
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      return;
    }

    setLoading(true);
    try {
      await photoAPI.deletePhoto(photo.id);
      onDeleted(photo.id);
    } catch (err) {
      setError('Không thể xóa ảnh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = `${API_BASE_URL}${photo.image_url}`;
  const uploadDate = new Date(photo.uploaded_at).toLocaleDateString('vi-VN');

  return (
    <>
      <div className="photo-card" onClick={() => setShowDetail(true)}>
        <div className="photo-image">
          <img src={imageUrl} alt={photo.title} />
        </div>
        <div className="photo-info">
          <h3>{photo.title}</h3>
          <p className="photo-date">{uploadDate}</p>
          {error && <p className="error-text">{error}</p>}
        </div>
        <button
          className="btn-delete"
          onClick={handleDelete}
          disabled={loading}
          title="Xóa ảnh"
        >
          {loading ? '⌛' : '🗑️'}
        </button>
      </div>

      {showDetail && (
        <PhotoDetailModal
          photo={photo}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
