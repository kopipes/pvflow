import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import {
  LayoutDashboard,
  Columns,
  Clock,
  Calendar as CalendarIcon,
  FolderOpen,
  Users,
  Plus,
  Sparkles,
  X,
  Settings,
  Shield,
  Database,
  ChevronDown,
  Briefcase,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', label: 'Kanban Board', icon: Columns },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'projects', label: 'Projects', icon: Briefcase },
];

const adminItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'users', label: 'User Management', icon: Shield },
  { id: 'divisions', label: 'Divisions', icon: Database },
];

function Sidebar({ onNewTask, onNewProject, onAIFeedback, isOpen, onClose }) {
  const { 
    currentView, 
    setCurrentView, 
    currentUser,
    setCurrentUser,
    users,
    isAdmin,
    isCorporate,
    canAccessAdminSettings,
    canManageUsers,
    canManageDivisions,
  } = useTaskStore();
  
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  
  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    if (onClose) onClose();
  };
  
  const handleUserSwitch = (userId) => {
    setCurrentUser(userId);
    setShowUserSwitcher(false);
  };
  
  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': '#dc2626',
      'corporate': '#ea580c',
      'manager': '#16a34a',
      'spv': '#3b82f6',
      'user': '#8b5cf6',
    };
    return colors[role] || '#6b7280';
  };
  
  const getRoleDisplayName = (role) => {
    const names = {
      'admin': 'Admin',
      'corporate': 'Corporate',
      'manager': 'Manager',
      'spv': 'Supervisor',
      'user': 'User',
    };
    return names[role] || role;
  };
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">PVFlow</span>
        </div>
        <button className="sidebar-close mobile-only" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Admin Only Items */}
        {(isAdmin() || isCorporate()) && (
          <>
            <div className="nav-divider" />
            <div className="nav-section-title">Administration</div>
            {canManageUsers() && (
              <button
                className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
                onClick={() => handleNavClick('users')}
              >
                <Shield size={18} />
                <span>User Management</span>
              </button>
            )}
            {canManageDivisions() && (
              <button
                className={`nav-item ${currentView === 'divisions' ? 'active' : ''}`}
                onClick={() => handleNavClick('divisions')}
              >
                <Database size={18} />
                <span>Division Master</span>
              </button>
            )}
            {canAccessAdminSettings() && (
              <button
                className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                onClick={() => handleNavClick('settings')}
              >
                <Settings size={18} />
                <span>Admin Settings</span>
              </button>
            )}
          </>
        )}
      </nav>
      
      <div className="sidebar-section">
        <div className="section-title">Quick Actions</div>
        <button className="action-btn primary" onClick={onNewTask}>
          <Plus size={16} />
          <span>New Task</span>
        </button>
        <button className="action-btn" onClick={onNewProject}>
          <FolderOpen size={16} />
          <span>New Project</span>
        </button>
        <button className="action-btn" onClick={onAIFeedback}>
          <Sparkles size={16} />
          <span>AI Feedback Import</span>
        </button>
      </div>
      
      <div className="sidebar-footer">
        {/* User Switcher for Demo */}
        <div className="user-switcher">
          <button 
            className="user-switcher-btn"
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
          >
            <div 
              className="user-avatar"
              style={{ background: currentUser.color }}
            >
              {currentUser.initials}
            </div>
            <div className="user-details">
              <div className="user-name">{currentUser.name}</div>
              <div 
                className="user-role"
                style={{ color: getRoleBadgeColor(currentUser.role) }}
              >
                {getRoleDisplayName(currentUser.role)}
              </div>
            </div>
            <ChevronDown size={16} className={`chevron ${showUserSwitcher ? 'open' : ''}`} />
          </button>
          
          {showUserSwitcher && (
            <div className="user-dropdown">
              <div className="dropdown-header">Switch User (Demo)</div>
              {users.map(user => (
                <button
                  key={user.id}
                  className={`dropdown-item ${user.id === currentUser.id ? 'active' : ''}`}
                  onClick={() => handleUserSwitch(user.id)}
                >
                  <div 
                    className="dropdown-avatar"
                    style={{ background: user.color }}
                  >
                    {user.initials}
                  </div>
                  <div className="dropdown-info">
                    <div className="dropdown-name">{user.name}</div>
                    <div 
                      className="dropdown-role"
                      style={{ color: getRoleBadgeColor(user.role) }}
                    >
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>
                  {user.id === currentUser.id && (
                    <span className="current-badge">Current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;