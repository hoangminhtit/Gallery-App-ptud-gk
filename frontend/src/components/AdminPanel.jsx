import { useEffect, useState } from 'react';
import { userAPI, adminAPI } from '../api';

export default function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeUserId, setActiveUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.listUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    setActiveUserId(userId);
    setError('');

    try {
      const response = await adminAPI.updateUserRole(userId, role);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? response.data : user
        )
      );
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể cập nhật vai trò');
    } finally {
      setActiveUserId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    setActiveUserId(userId);
    setError('');

    try {
      await adminAPI.deleteUser(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể xóa người dùng');
    } finally {
      setActiveUserId(null);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Quản lý người dùng</h2>
        <button className="btn-refresh-users" onClick={fetchUsers} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser.id;
              const isBusy = activeUserId === user.id;

              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      disabled={isCurrentUser || isBusy}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn-delete-user"
                      disabled={isCurrentUser || isBusy}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      {isBusy ? 'Đang xử lý...' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-users">
                  Chưa có người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
