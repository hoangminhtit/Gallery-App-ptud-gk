import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { photoAPI } from '../api';
import { FEATURE_FLAGS } from '../featureFlags';
import PhotoCard from './PhotoCard';
import UploadModal from './UploadModal';
import AdminPanel from './AdminPanel';
import '../styles/Gallery.css';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('uploaded_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
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

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchPhotos();
  }, [searchTerm, page, limit, sortBy, sortOrder, startDate, endDate, tagFilter, favoritesOnly, includeDeleted]);

  const fetchPhotos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: searchTerm || undefined,
      };

      if (FEATURE_FLAGS.pagination) {
        params.page = page;
        params.limit = limit;
      }
      if (FEATURE_FLAGS.sortPhotos) {
        params.sort_by = sortBy;
        params.sort_order = sortOrder;
      }
      if (FEATURE_FLAGS.filterByDate) {
        params.start_date = startDate || undefined;
        params.end_date = endDate || undefined;
      }
      if (FEATURE_FLAGS.tags) {
        params.tags = tagFilter || undefined;
      }
      if (FEATURE_FLAGS.favorites) {
        params.favorite_only = favoritesOnly || undefined;
      }
      if (FEATURE_FLAGS.softDelete) {
        params.include_deleted = includeDeleted || undefined;
      }

      const response = await photoAPI.getPhotos(params);
      const totalHeader = response.headers?.['x-total-count'];
      if (FEATURE_FLAGS.pagination) {
        setTotalCount(Number(totalHeader || 0));
      } else {
        setTotalCount(response.data.length || 0);
      }
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
    setPage(1);
  };

  const handlePhotoDeleted = (photoId) => {
    if (FEATURE_FLAGS.softDelete) {
      fetchPhotos();
      return;
    }
    setPhotos(photos.filter((photo) => photo.id !== photoId));
  };

  const handlePhotoUploaded = (newPhoto) => {
    setPhotos([newPhoto, ...photos]);
    setShowUploadModal(false);
  };

  const handlePhotosUploaded = (newPhotos) => {
    setPhotos([...newPhotos, ...photos]);
    setShowUploadModal(false);
  };

  const handlePhotoUpdated = (updatedPhoto) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === updatedPhoto.id ? updatedPhoto : photo))
    );
  };

  const handlePhotoRestored = () => {
    fetchPhotos();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalPages = useMemo(() => {
    if (!FEATURE_FLAGS.pagination) {
      return 1;
    }
    return Math.max(1, Math.ceil(totalCount / limit));
  }, [totalCount, limit]);

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

      {(FEATURE_FLAGS.filterByDate || FEATURE_FLAGS.sortPhotos || FEATURE_FLAGS.tags || FEATURE_FLAGS.favorites || FEATURE_FLAGS.pagination || FEATURE_FLAGS.softDelete) && (
        <div className="gallery-filters">
          {FEATURE_FLAGS.filterByDate && (
            <div className="filter-group">
              <label>Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}

          {FEATURE_FLAGS.filterByDate && (
            <div className="filter-group">
              <label>Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}

          {FEATURE_FLAGS.sortPhotos && (
            <div className="filter-group">
              <label>Sắp xếp</label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [nextSortBy, nextSortOrder] = e.target.value.split(':');
                  setSortBy(nextSortBy);
                  setSortOrder(nextSortOrder);
                }}
              >
                <option value="uploaded_at:desc">Mới nhất</option>
                <option value="uploaded_at:asc">Cũ nhất</option>
                <option value="title:asc">Tên A-Z</option>
                <option value="title:desc">Tên Z-A</option>
              </select>
            </div>
          )}

          {FEATURE_FLAGS.tags && (
            <div className="filter-group">
              <label>Tag</label>
              <input
                type="text"
                placeholder="travel, family"
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}

          {FEATURE_FLAGS.favorites && (
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => {
                  setFavoritesOnly(e.target.checked);
                  setPage(1);
                }}
              />
              Chỉ yêu thích
            </label>
          )}

          {FEATURE_FLAGS.softDelete && (
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setPage(1);
                }}
              />
              Hiển thị đã xóa
            </label>
          )}

          {FEATURE_FLAGS.pagination && (
            <div className="filter-group">
              <label>Số ảnh/trang</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          )}
        </div>
      )}

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
              onUpdated={handlePhotoUpdated}
              onRestored={handlePhotoRestored}
              includeDeleted={includeDeleted}
            />
          ))}
        </div>
      )}

      {FEATURE_FLAGS.pagination && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Trước
          </button>
          <span>Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Sau
          </button>
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onPhotoUploaded={handlePhotoUploaded}
          onPhotosUploaded={handlePhotosUploaded}
        />
      )}
    </div>
  );
}
