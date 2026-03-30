import { useState } from 'react';
import { photoAPI, API_BASE_URL } from '../api';
import { FEATURE_FLAGS } from '../featureFlags';
import '../styles/Modal.css';

export default function PhotoDetailModal({ photo, onClose, onUpdated, includeDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [tagsInput, setTagsInput] = useState(Array.isArray(photo.tags) ? photo.tags.join(', ') : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        title,
        description,
      };

      if (FEATURE_FLAGS.tags) {
        const tags = tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        payload.tags = tags;
      }

      const response = await photoAPI.updatePhoto(photo.id, payload);
      setIsEditing(false);
      onUpdated?.(response.data);
    } catch (err) {
      setError('Không thể cập nhật ảnh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
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

  const handleDownload = async () => {
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
  const uploadDate = new Date(photo.uploaded_at).toLocaleString('vi-VN');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-body">
          <div className="photo-display">
            <img src={imageUrl} alt={photo.title} />
          </div>
          
          <div className="photo-details">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Tên ảnh</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                  />
                </div>

                {FEATURE_FLAGS.tags && (
                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="travel, family"
                    />
                  </div>
                )}

                {error && <p className="error-message">{error}</p>}
                
                <div className="action-buttons">
                  <button 
                    className="btn-save" 
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button 
                    className="btn-cancel" 
                    onClick={() => {
                      setIsEditing(false);
                      setTitle(photo.title);
                      setDescription(photo.description || '');
                      setTagsInput(Array.isArray(photo.tags) ? photo.tags.join(', ') : '');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{photo.title}</h2>
                <p className="description">{photo.description || 'Không có mô tả'}</p>
                {FEATURE_FLAGS.tags && Array.isArray(photo.tags) && photo.tags.length > 0 && (
                  <div className="tag-list">
                    {photo.tags.map((tag) => (
                      <span key={tag} className="tag-pill">#{tag}</span>
                    ))}
                  </div>
                )}
                <p className="upload-date">Tải lên: {uploadDate}</p>
                
                <div className="action-buttons">
                  <button 
                    className="btn-edit" 
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa
                  </button>
                  {FEATURE_FLAGS.favorites && (
                    <button
                      className="btn-secondary"
                      onClick={handleToggleFavorite}
                      disabled={loading}
                    >
                      {photo.is_favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                    </button>
                  )}
                  {FEATURE_FLAGS.download && (
                    <button
                      className="btn-secondary"
                      onClick={handleDownload}
                      disabled={loading}
                    >
                      Tải ảnh
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
