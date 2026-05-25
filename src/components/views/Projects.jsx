import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { FolderOpen, Plus, Search, Edit2, Trash2, X, Users, LayoutGrid } from 'lucide-react';
import ProjectModal from '../features/ProjectModal';
import './Projects.css';

function Projects() {
  const { projects, divisions, tasks, users, deleteProject, currentUser } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const canManage = currentUser.role === 'admin' || currentUser.role === 'corporate' || currentUser.role === 'manager';

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    const activeTasks = projectTasks.filter(t => !['delivered', 'approved'].includes(t.status));
    const completedTasks = projectTasks.filter(t => ['delivered', 'approved'].includes(t.status));
    return {
      total: projectTasks.length,
      active: activeTasks.length,
      completed: completedTasks.length
    };
  };

  const getDivisionName = (divisionId) => {
    const division = divisions.find(d => d.id === divisionId);
    return division?.name || 'Unassigned';
  };

  const getTaskAssignees = (projectId) => {
    const projectTaskIds = tasks.filter(t => t.project_id === projectId).map(t => t.assignee_id);
    const uniqueAssignees = [...new Set(projectTaskIds)];
    return users.filter(u => uniqueAssignees.includes(u.id)).slice(0, 5);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProject = (formData) => {
    setEditingProject(null);
    setShowAddModal(false);
  };

  const handleDeleteProject = () => {
    if (showDeleteConfirm) {
      deleteProject(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="header-title">
          <FolderOpen size={24} />
          <h1>Projects</h1>
          <span className="project-count">{projects.length} projects</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          {canManage && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => {
          const stats = getProjectStats(project.id);
          const assignees = getTaskAssignees(project.id);
          return (
            <div key={project.id} className="project-card">
              <div className="card-header">
                <div className="project-icon" style={{ background: project.color || '#6366f1' }}>
                  <LayoutGrid size={20} />
                </div>
                <div className="project-info">
                  <div className="project-name">{project.name}</div>
                  <div className="project-client">{project.client || 'No client'}</div>
                </div>
                {canManage && (
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => setEditingProject(project)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="delete-btn" onClick={() => setShowDeleteConfirm(project)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="card-meta">
                <div className="meta-item">
                  <LayoutGrid size={14} />
                  <span>{getDivisionName(project.division_id)}</span>
                </div>
              </div>

              <div className="card-stats">
                <div className="stat-item">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value active">{stats.active}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value completed">{stats.completed}</span>
                  <span className="stat-label">Done</span>
                </div>
              </div>

              {assignees.length > 0 && (
                <div className="card-assignees">
                  <div className="assignees-label">
                    <Users size={14} />
                    <span>Assignees</span>
                  </div>
                  <div className="assignees-avatars">
                    {assignees.map(user => (
                      <div 
                        key={user.id} 
                        className="user-avatar-xs"
                        style={{ background: user.color }}
                        title={user.name}
                      >
                        {user.initials}
                      </div>
                    ))}
                    {assignees.length === 5 && tasks.filter(t => t.project_id === project.id).length > 5 && (
                      <div className="more-badge">+</div>
                    )}
                  </div>
                </div>
              )}

              <div className="card-progress">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%',
                    background: project.color || '#6366f1'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <FolderOpen size={48} />
          <p>No projects found matching your search.</p>
          {canManage && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Create First Project
            </button>
          )}
        </div>
      )}

      <ProjectModal 
        isOpen={showAddModal || !!editingProject} 
        onClose={() => { setShowAddModal(false); setEditingProject(null); }} 
        onSave={handleSaveProject} 
        editingProject={editingProject} 
      />

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-container confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Project</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This will not delete the tasks associated with this project.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteProject}>Delete Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;