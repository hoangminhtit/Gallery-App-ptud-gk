import { useState } from 'react';
import { photoAPI, API_BASE_URL } from '../api';
import '../styles/Modal.css';

export default function PhotoDetailModal({ photo, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await photoAPI.updatePhoto(photo.id, {
        title,
        description,
      });
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      setError('Không thể cập nhật ảnh');
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
                <p className="upload-date">Tải lên: {uploadDate}</p>
                
                <button 
                  className="btn-edit" 
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
