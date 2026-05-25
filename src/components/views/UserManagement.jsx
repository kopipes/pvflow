import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { Users, Shield, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import AddUserModal from '../features/AddUserModal';
import './UserManagement.css';

function UserManagement() {
  const { users, divisions, currentUser, isAdmin, isCorporate, addUser, updateUser, deleteUser } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const canManage = isAdmin() || isCorporate();
  
  if (!canManage) {
    return (
      <div className="user-management-page">
        <div className="access-denied">
          <Shield size={48} />
          <h2>Access Denied</h2>
          <p>You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const colors = { 'admin': '#dc2626', 'corporate': '#ea580c', 'manager': '#16a34a', 'spv': '#3b82f6', 'user': '#8b5cf6' };
    return colors[role] || '#6b7280';
  };

  const getRoleDisplayName = (role) => {
    const names = { 'admin': 'Admin', 'corporate': 'Corporate', 'manager': 'Manager', 'spv': 'Supervisor', 'user': 'User' };
    return names[role] || role;
  };

  const getDivisionName = (divisionId) => {
    const division = divisions.find(d => d.id === divisionId);
    return division?.name || 'Unknown';
  };

  const handleSaveUser = (formData) => {
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    if (showDeleteConfirm) {
      deleteUser(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div className="header-title">
          <Users size={24} />
          <h1>User Management</h1>
          <span className="user-count">{users.length} users</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="card-header">
              <div className="user-avatar" style={{ background: user.color }}>{user.initials}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role-badge" style={{ color: getRoleBadgeColor(user.role) }}>
                  {getRoleDisplayName(user.role)}
                </div>
              </div>
              <div className="card-actions">
                <button className="edit-btn" onClick={() => setEditingUser(user)}><Edit2 size={14} /></button>
                {user.id !== currentUser.id && (
                  <button className="delete-btn" onClick={() => setShowDeleteConfirm(user)}><Trash2 size={14} /></button>
                )}
              </div>
            </div>
            <div className="card-details">
              <div className="detail-item"><span>Email:</span> {user.email}</div>
              <div className="detail-item"><span>Password:</span> {user.password ? '••••••' : 'Not set'}</div>
              <div className="detail-item"><span>Division:</span> {getDivisionName(user.division_id)}</div>
            </div>
            {user.id === currentUser.id && <div className="current-user-badge">Current User</div>}
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="empty-state"><Users size={48} /><p>No users found matching your search.</p></div>
      )}

      <AddUserModal isOpen={showAddModal || !!editingUser} onClose={() => { setShowAddModal(false); setEditingUser(null); }} onSave={handleSaveUser} editingUser={editingUser} />

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-container confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete User</h2><button className="close-btn" onClick={() => setShowDeleteConfirm(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteUser}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;