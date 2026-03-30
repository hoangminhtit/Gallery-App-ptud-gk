import { useState } from 'react';
import { photoAPI, API_BASE_URL } from '../api';
import { FEATURE_FLAGS } from '../featureFlags';
import PhotoDetailModal from './PhotoDetailModal';
import '../styles/PhotoCard.css';

export default function PhotoCard({ photo, onDeleted, onUpdated, onRestored, includeDeleted }) {
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isDeleted = FEATURE_FLAGS.softDelete && photo.deleted_at;
  const tags = Array.isArray(photo.tags) ? photo.tags : [];

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

  const handleRestore = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError('');
    try {
      const response = await photoAPI.restorePhoto(photo.id);
      onUpdated?.(response.data);
      onRestored?.();
    } catch (err) {
      setError('Không thể khôi phục ảnh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError('');
    try {
      const response = await photoAPI.setFavorite(photo.id, !photo.is_favorite);
      onUpdated?.(response.data);
    } catch (err) {
      setError('Không thể cập nhật yêu thích');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError('');
    try {
      const response = await photoAPI.downloadPhoto(photo.id, includeDeleted);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${photo.title || 'photo'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError('Không thể tải ảnh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = `${API_BASE_URL}${photo.image_url}`;
  const uploadDate = new Date(photo.uploaded_at).toLocaleDateString('vi-VN');

  return (
    <>
      <div className={`photo-card ${isDeleted ? 'photo-card--deleted' : ''}`} onClick={() => setShowDetail(true)}>
        <div className="photo-image">
          <img src={imageUrl} alt={photo.title} />
        </div>
        <div className="photo-info">
          <h3>{photo.title}</h3>
          {tags.length > 0 && (
            <div className="photo-tags">
              {tags.map((tag) => (
                <span key={tag} className="tag-pill">#{tag}</span>
              ))}
            </div>
          )}
          <p className="photo-date">{uploadDate}</p>
          {error && <p className="error-text">{error}</p>}
        </div>
        {!isDeleted && (
          <button
            className="btn-delete"
            onClick={handleDelete}
            disabled={loading}
            title="Xóa ảnh"
          >
            {loading ? '⌛' : '🗑️'}
          </button>
        )}

        {FEATURE_FLAGS.favorites && (
          <button
            className={`btn-favorite ${photo.is_favorite ? 'is-active' : ''}`}
            onClick={handleToggleFavorite}
            disabled={loading || isDeleted}
            title="Yêu thích"
          >
            {photo.is_favorite ? '★' : '☆'}
          </button>
        )}

        {FEATURE_FLAGS.download && (
          <button
            className="btn-download"
            onClick={handleDownload}
            disabled={loading}
            title="Tải ảnh"
          >
            ⬇
          </button>
        )}

        {isDeleted && (
          <button
            className="btn-restore"
            onClick={handleRestore}
            disabled={loading}
            title="Khôi phục"
          >
            Khôi phục
          </button>
        )}
      </div>

      {showDetail && (
        <PhotoDetailModal
          photo={photo}
          onClose={() => setShowDetail(false)}
          onUpdated={onUpdated}
          includeDeleted={includeDeleted}
        />
      )}
    </>
  );
}
