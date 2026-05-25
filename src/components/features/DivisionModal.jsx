import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../views/UserManagement.css';

function DivisionModal({ isOpen, onClose, onSave, editingDivision }) {
  const [formData, setFormData] = useState({ name: '', color: '#6366f1' });
  const [errors, setErrors] = useState({});

  const colors = [
    '#6366f1', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#ef4444', '#14b8a6'
  ];

  useEffect(() => {
    if (editingDivision) {
      setFormData({ name: editingDivision.name, color: editingDivision.color });
    } else {
      setFormData({ name: '', color: colors[Math.floor(Math.random() * colors.length)] });
    }
    setErrors({});
  }, [editingDivision, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Division name is required';
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container user-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingDivision ? 'Edit Division' : 'Add New Division'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Division Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter division name" className={errors.name ? 'error' : ''} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colors.map(color => (
                  <button key={color} type="button" className={`color-option ${formData.color === color ? 'selected' : ''}`} style={{ background: color }} onClick={() => setFormData(prev => ({ ...prev, color }))} />
                ))}
              </div>
            </div>
            <div className="color-preview">
              <div className="preview-label">Preview:</div>
              <div className="preview-box" style={{ background: formData.color }}>
                <span>{formData.name || 'Division Name'}</span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{editingDivision ? 'Save Changes' : 'Add Division'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DivisionModal;