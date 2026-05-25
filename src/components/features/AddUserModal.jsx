import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { X } from 'lucide-react';
import '../views/UserManagement.css';

function AddUserModal({ isOpen, onClose, onSave, editingUser }) {
  const { divisions } = useTaskStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    division_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: editingUser.password || '',
        role: editingUser.role,
        division_id: editingUser.division_id,
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'user', division_id: '' });
    }
    setErrors({});
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!editingUser && !formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password && formData.password.length < 4) newErrors.password = 'Password must be at least 4 characters';
    if (!formData.division_id) newErrors.division_id = 'Division is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const roles = [
    { id: 'admin', label: 'Admin' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'manager', label: 'Manager' },
    { id: 'spv', label: 'Supervisor' },
    { id: 'user', label: 'User' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container user-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password {!editingUser && '*'}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Division *</label>
                <select 
                  name="division_id" 
                  value={formData.division_id} 
                  onChange={handleChange}
                  className={errors.division_id ? 'error' : ''}
                >
                  <option value="">Select division</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.division_id && <span className="error-text">{errors.division_id}</span>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{editingUser ? 'Save Changes' : 'Add User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;