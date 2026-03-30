import { useState } from 'react';
import { photoAPI } from '../api';
import { FEATURE_FLAGS } from '../featureFlags';
import '../styles/Modal.css';

export default function UploadModal({ onClose, onPhotoUploaded, onPhotosUploaded }) {
  const [uploadSource, setUploadSource] = useState('file');
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) {
      return;
    }

    if (FEATURE_FLAGS.multiUpload) {
      const invalid = selectedFiles.find((item) => !item.type.startsWith('image/'));
      if (invalid) {
        setError('Vui lòng chọn các tệp hình ảnh hợp lệ');
        return;
      }
      setFiles(selectedFiles);
      setError('');

      if (FEATURE_FLAGS.previewUpload) {
        Promise.all(selectedFiles.map((item) => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(item);
        }))).then((previews) => setFilePreviews(previews));
      }
      return;
    }

    const selectedFile = selectedFiles[0];
    if (!selectedFile.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh');
      return;
    }
    setFile(selectedFile);
    setError('');
    if (FEATURE_FLAGS.previewUpload) {
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

    if (!FEATURE_FLAGS.multiUpload && !title.trim()) {
      setError('Vui lòng nhập tên ảnh');
      return;
    }

    if (FEATURE_FLAGS.multiUpload && files.length === 1 && !title.trim()) {
      setError('Vui lòng nhập tên ảnh');
      return;
    }

    if (FEATURE_FLAGS.multiUpload && files.length === 0 && uploadSource === 'file') {
      setError('Vui lòng chọn ít nhất một ảnh');
      return;
    }

    if (!FEATURE_FLAGS.multiUpload && !file && uploadSource === 'file') {
      setError('Vui lòng chọn một ảnh');
      return;
    }

    if (uploadSource === 'url' && !imageUrl.trim()) {
      setError('Vui lòng nhập đường link ảnh');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (FEATURE_FLAGS.tags && tagsInput.trim()) {
        formData.append('tags', tagsInput);
      }
      if (uploadSource === 'url') {
        const payload = {
          url: imageUrl.trim(),
          title: title.trim() || undefined,
          description: description || undefined,
        };
        if (FEATURE_FLAGS.tags && tagsInput.trim()) {
          payload.tags = tagsInput
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
        }
        const response = await photoAPI.uploadPhotoFromUrl(payload);
        onPhotoUploaded(response.data);
      } else if (FEATURE_FLAGS.multiUpload) {
        if (title.trim()) {
          formData.append('title', title.trim());
        }
        formData.append('description', description);
        files.forEach((item) => formData.append('files', item));
        const response = await photoAPI.uploadPhotosBatch(formData);
        onPhotosUploaded?.(response.data || []);
      } else {
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file', file);
        const response = await photoAPI.uploadPhoto(formData);
        onPhotoUploaded(response.data);
      }
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
          {FEATURE_FLAGS.uploadFromUrl && (
            <div className="upload-source-toggle">
              <button
                type="button"
                className={`toggle-button ${uploadSource === 'file' ? 'is-active' : ''}`}
                onClick={() => setUploadSource('file')}
              >
                Từ máy
              </button>
              <button
                type="button"
                className={`toggle-button ${uploadSource === 'url' ? 'is-active' : ''}`}
                onClick={() => setUploadSource('url')}
              >
                Từ link
              </button>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="title">Tên ảnh {FEATURE_FLAGS.multiUpload ? '(tùy chọn)' : '*'}</label>
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

          {FEATURE_FLAGS.tags && (
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="travel, family"
              />
            </div>
          )}

          {uploadSource === 'file' && (
            <div className="form-group">
              <label htmlFor="file">Chọn ảnh *</label>
              <input
                type="file"
                id="file"
                accept="image/*"
                multiple={FEATURE_FLAGS.multiUpload}
                onChange={handleFileChange}
                required
              />
            </div>
          )}

          {uploadSource === 'url' && (
            <div className="form-group">
              <label htmlFor="imageUrl">Đường link ảnh *</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                required
              />
            </div>
          )}

          {uploadSource === 'file' && FEATURE_FLAGS.previewUpload && FEATURE_FLAGS.multiUpload && filePreviews.length > 0 && (
            <div className="file-preview-grid">
              {filePreviews.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index + 1}`} />
              ))}
            </div>
          )}

          {uploadSource === 'file' && FEATURE_FLAGS.previewUpload && !FEATURE_FLAGS.multiUpload && filePreview && (
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
