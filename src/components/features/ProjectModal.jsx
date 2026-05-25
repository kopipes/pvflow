import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { X, Plus, Users } from 'lucide-react';
import './NewTaskModal.css';

function ProjectModal({ isOpen, onClose }) {
  const { divisions, addProject, currentUser, isAdmin, isCorporate, isManager } = useTaskStore();
  
  const [formData, setFormData] = useState({
    name: '', client: '', division_id: currentUser.division_id, color: '#6366f1'
  });
  
  if (!isOpen) return null;
  
  const canCreateProject = isAdmin() || isCorporate() || isManager();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    addProject({
      name: formData.name,
      client: formData.client,
      division_id: formData.division_id,
      color: formData.color,
    });
    
    setFormData({ name: '', client: '', division_id: currentUser.division_id, color: '#6366f1' });
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        {canCreateProject ? (
          <form className="modal-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter project name" required autoFocus />
            </div>
            
            <div className="form-group">
              <label>Client Name</label>
              <input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="Enter client name" />
            </div>
            
            {(isAdmin() || isCorporate()) && (
              <div className="form-group">
                <label><Users size={14} />Division</label>
                <select name="division_id" value={formData.division_id} onChange={handleChange}>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            
            <div className="form-group">
              <label>Project Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" name="color" value={formData.color} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer' }} />
                <input type="text" value={formData.color} onChange={handleChange} name="color" style={{ flex: 1, background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-primary)' }} />
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary"><Plus size={16} />Create Project</button>
            </div>
          </form>
        ) : (
          <div className="modal-body" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>You don't have permission to create projects.</p>
            <button className="btn-secondary" onClick={onClose} style={{ marginTop: '16px' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectModal;