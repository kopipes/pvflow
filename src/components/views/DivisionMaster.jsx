import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { Database, Shield, Plus, Search, Edit2, Trash2, X, Users, FolderOpen, LayoutGrid } from 'lucide-react';
import DivisionModal from '../features/DivisionModal';
import './UserManagement.css';

function DivisionMaster() {
  const { divisions, users, projects, currentUser, isAdmin, isCorporate, addDivision, updateDivision, deleteDivision } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDivision, setEditingDivision] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const canManage = isAdmin() || isCorporate();
  
  if (!canManage) {
    return (
      <div className="division-master-page">
        <div className="access-denied">
          <Shield size={48} />
          <h2>Access Denied</h2>
          <p>You don't have permission to manage divisions.</p>
        </div>
      </div>
    );
  }

  const getDivisionStats = (divisionId) => {
    const divisionUsers = users.filter(u => u.division_id === divisionId);
    const divisionProjects = projects.filter(p => p.division_id === divisionId);
    return { userCount: divisionUsers.length, projectCount: divisionProjects.length, users: divisionUsers, projects: divisionProjects };
  };

  const filteredDivisions = divisions.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSaveDivision = (formData) => {
    if (editingDivision) {
      updateDivision(editingDivision.id, formData);
    } else {
      addDivision(formData);
    }
    setEditingDivision(null);
  };

  const handleDeleteDivision = () => {
    if (showDeleteConfirm) {
      deleteDivision(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="division-master-page">
      <div className="page-header">
        <div className="header-title">
          <Database size={24} />
          <h1>Division Master</h1>
          <span className="division-count">{divisions.length} divisions</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search divisions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Division
          </button>
        </div>
      </div>

      <div className="divisions-grid">
        {filteredDivisions.map((division, index) => {
          const stats = getDivisionStats(division.id);
          return (
            <div key={division.id} className="division-card">
              <div className="card-header">
                <div className="division-icon" style={{ background: division.color }}>
                  <LayoutGrid size={20} />
                </div>
                <div className="division-info">
                  <div className="division-name">{division.name}</div>
                  <div className="division-id">ID: {division.id}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => setEditingDivision(division)}><Edit2 size={14} /></button>
                  <button className="delete-btn" onClick={() => setShowDeleteConfirm(division)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="card-stats">
                <div className="stat-item"><Users size={16} /><span className="stat-value">{stats.userCount}</span><span className="stat-label">Users</span></div>
                <div className="stat-item"><FolderOpen size={16} /><span className="stat-value">{stats.projectCount}</span><span className="stat-label">Projects</span></div>
              </div>
              <div className="card-breakdown">
                <div className="breakdown-section">
                  <div className="breakdown-title">Users</div>
                  <div className="breakdown-list">
                    {stats.users.slice(0, 4).map(user => {
                      const bgColor = user.color || '#4f7cff';
                      // Check if background is too light (>= #CCCCCC) for white text to be visible
                      const isLightBg = bgColor && bgColor.startsWith('#') && parseInt(bgColor.replace('#', ''), 16) > 0xCCCCCC;
                      return (
                        <div key={user.id} className="breakdown-item">
                          <div className="user-avatar-xs" style={{ 
                            background: isLightBg ? '#4f7cff' : bgColor, 
                            color: '#ffffff' 
                          }}>
                            {user.initials}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      );
                    })}
                    {stats.users.length > 4 && <div className="more-badge">+{stats.users.length - 4} more</div>}
                    {stats.users.length === 0 && <div className="empty-label">No users assigned</div>}
                  </div>
                </div>
                <div className="breakdown-section">
                  <div className="breakdown-title">Projects</div>
                  <div className="breakdown-list">
                    {stats.projects.slice(0, 3).map(project => (
                      <div key={project.id} className="breakdown-item project"><div className="project-dot" style={{ background: project.color || division.color }} /><span>{project.name}</span></div>
                    ))}
                    {stats.projects.length > 3 && <div className="more-badge">+{stats.projects.length - 3} more</div>}
                    {stats.projects.length === 0 && <div className="empty-label">No projects</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDivisions.length === 0 && (
        <div className="empty-state"><Database size={48} /><p>No divisions found matching your search.</p></div>
      )}

      <DivisionModal isOpen={showAddModal || !!editingDivision} onClose={() => { setShowAddModal(false); setEditingDivision(null); }} onSave={handleSaveDivision} editingDivision={editingDivision} />

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-container confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Division</h2><button className="close-btn" onClick={() => setShowDeleteConfirm(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteDivision}>Delete Division</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DivisionMaster;