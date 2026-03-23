import React, { useState } from 'react';
import { photoAPI } from '../api';
import '../styles/Modal.css';

export default function UploadModal({ onClose, onPhotoUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Vui lòng chọn một tệp hình ảnh');
        return;
      }
      setFile(selectedFile);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Vui lòng nhập tên ảnh');
      return;
    }

    if (!file) {
      setError('Vui lòng chọn một ảnh');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', file);

      const response = await photoAPI.uploadPhoto(formData);
      onPhotoUploaded(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tải ảnh lên');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Tải ảnh lên</h2>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="title">Tên ảnh *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên ảnh"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả (tùy chọn)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Chọn ảnh *</label>
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          {filePreview && (
            <div className="file-preview">
              <img src={filePreview} alt="Preview" />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Đang tải...' : 'Tải ảnh lên'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="btn-cancel"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
