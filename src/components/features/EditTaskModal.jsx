import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import {
  X,
  Calendar,
  User,
  Tag,
  AlertCircle,
  Plus,
  CheckCircle,
  Users,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import './NewTaskModal.css'; // Reuse styles

function EditTaskModal({ isOpen, onClose, task }) {
  const { 
    users, 
    priorities, 
    divisions,
    projects,
    currentUser,
    updateTask,
    deleteTask,
    isAdmin,
    isCorporate,
    isManager,
    isSpv,
  } = useTaskStore();
  
  // Filter users based on role permissions
  const getAvailableUsers = () => {
    if (isAdmin() || isCorporate()) {
      return users;
    }
    if (isManager() || isSpv()) {
      return users.filter(u => u.division_id === currentUser.division_id);
    }
    return users;
  };
  
  const availableUsers = getAvailableUsers();
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    brief: task?.brief || '',
    assignee_id: task?.assignee_id || '',
    priority: task?.priority || 'medium',
    due_date: task?.due_date ? task.due_date.slice(0, 16) : '',
    revision_deadline: task?.revision_deadline ? task.revision_deadline.slice(0, 16) : '',
    approval_deadline: task?.approval_deadline ? task.approval_deadline.slice(0, 16) : '',
    tags: task?.tags || [],
    division_id: task?.division_id || currentUser.division_id,
    project_id: task?.project_id || '',
  });
  
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Update form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        brief: task.brief || '',
        assignee_id: task.assignee_id || '',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        revision_deadline: task.revision_deadline ? task.revision_deadline.slice(0, 16) : '',
        approval_deadline: task.approval_deadline ? task.approval_deadline.slice(0, 16) : '',
        tags: task.tags || [],
        division_id: task.division_id || currentUser.division_id,
        project_id: task.project_id || '',
      });
    }
  }, [task]);
  
  if (!isOpen || !task) return null;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    updateTask(task.id, {
      title: formData.title,
      brief: formData.brief,
      assignee_id: formData.assignee_id || null,
      priority: formData.priority,
      due_date: formData.due_date || null,
      revision_deadline: formData.revision_deadline || null,
      approval_deadline: formData.approval_deadline || null,
      tags: formData.tags,
      division_id: formData.division_id,
      project_id: formData.project_id || null,
    });
    
    onClose();
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTask(task.id);
      onClose();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Brief / Description</label>
            <textarea
              name="brief"
              value={formData.brief}
              onChange={handleChange}
              placeholder="Describe the task requirements..."
              rows={3}
            />
          </div>
          
          {/* Division selector - Admin/Corporate only */}
          {(isAdmin() || isCorporate()) && (
            <div className="form-group">
              <label>
                <Users size={14} />
                Division
              </label>
              <select
                name="division_id"
                value={formData.division_id}
                onChange={handleChange}
              >
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Project selector */}
          <div className="form-group">
            <label>
              <FolderOpen size={14} />
              Project
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
            >
              <option value="">No Project</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <User size={14} />
                Assignee
              </label>
              <select
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <AlertCircle size={14} />
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>
              <Calendar size={14} />
              Final Deadline
            </label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <CheckCircle size={14} />
                Revision Deadline
              </label>
              <input
                type="datetime-local"
                name="revision_deadline"
                value={formData.revision_deadline}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>
                <AlertCircle size={14} />
                Approval Deadline
              </label>
              <input
                type="datetime-local"
                name="approval_deadline"
                value={formData.approval_deadline}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>
              <Tag size={14} />
              Tags
            </label>
            <div className="tags-input">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder={formData.tags.length === 0 ? "Add tags..." : ""}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            {(isAdmin() || (isManager() && task?.division_id === currentUser.division_id)) && (
              <button 
                type="button" 
                className="btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;