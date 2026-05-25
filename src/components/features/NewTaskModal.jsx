import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { X, Calendar, User, Tag, AlertCircle, Plus, CheckCircle, Users, Folder } from 'lucide-react';
import './NewTaskModal.css';

function NewTaskModal({ isOpen, onClose }) {
  const { users, priorities, divisions, projects, currentUser, addTask, isAdmin, isCorporate, isManager, isSpv } = useTaskStore();
  
  const getAvailableUsers = () => {
    if (isAdmin() || isCorporate()) return users;
    if (isManager() || isSpv()) return users.filter(u => u.division_id === currentUser.division_id);
    return [];
  };
  
  const availableUsers = getAvailableUsers();
  const availableProjects = isAdmin() || isCorporate() || isManager() || isSpv() 
    ? projects.filter(p => p.division_id === currentUser.division_id || isAdmin() || isCorporate())
    : [];
  
  const [formData, setFormData] = useState({
    title: '', brief: '', project_id: '', assignee_id: '', priority: 'medium',
    due_date: '', revision_deadline: '', approval_deadline: '', tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  
  if (!isOpen) return null;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    addTask({
      title: formData.title, brief: formData.brief, project_id: formData.project_id || null,
      assignee_id: formData.assignee_id || null, priority: formData.priority, status: 'request',
      due_date: formData.due_date || null, revision_deadline: formData.revision_deadline || null,
      approval_deadline: formData.approval_deadline || null, tags: formData.tags,
      division_id: currentUser.division_id,
    });
    
    setFormData({ title: '', brief: '', project_id: '', assignee_id: '', priority: 'medium',
      due_date: '', revision_deadline: '', approval_deadline: '', tags: [] });
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter task title" required autoFocus />
          </div>
          
          <div className="form-group">
            <label>Brief / Description</label>
            <textarea name="brief" value={formData.brief} onChange={handleChange} placeholder="Describe the task requirements..." rows={3} />
          </div>
          
          {(isAdmin() || isCorporate()) && availableProjects.length > 0 && (
            <div className="form-group">
              <label><Folder size={14} />Project</label>
              <select name="project_id" value={formData.project_id} onChange={handleChange}>
                <option value="">No Project</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label><User size={14} />Assignee</label>
              <select name="assignee_id" value={formData.assignee_id} onChange={handleChange}>
                <option value="">Unassigned</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label><AlertCircle size={14} />Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label><Calendar size={14} />Final Deadline</label>
            <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleChange} />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><CheckCircle size={14} />Revision Deadline</label>
              <input type="datetime-local" name="revision_deadline" value={formData.revision_deadline} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label><AlertCircle size={14} />Approval Deadline</label>
              <input type="datetime-local" name="approval_deadline" value={formData.approval_deadline} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label><Tag size={14} />Tags</label>
            <div className="tags-input">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">{tag}<button type="button" onClick={() => handleRemoveTag(tag)}><X size={12} /></button></span>
              ))}
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} placeholder={formData.tags.length === 0 ? "Add tags..." : ""} />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Plus size={16} />Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewTaskModal;