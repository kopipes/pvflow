import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { apiService } from '../../api/apiService';
import {
  Settings,
  Database,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import './AdminSettings.css';

function AdminSettings() {
  const { currentUser } = useTaskStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [status, setStatus] = useState({ type: null, message: '' });
  
  const handleResetData = () => {
    setActionType('reset');
    setShowConfirm(true);
  };
  
  const handleClearAllData = () => {
    setActionType('clear');
    setShowConfirm(true);
  };
  
  const handleExportData = async () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.id,
        tasks: JSON.parse(localStorage.getItem('pvflow_tasks') || '[]'),
        projects: JSON.parse(localStorage.getItem('pvflow_projects') || '[]'),
        comments: JSON.parse(localStorage.getItem('pvflow_comments') || '{}'),
        logs: JSON.parse(localStorage.getItem('pvflow_logs') || '{}'),
        files: JSON.parse(localStorage.getItem('pvflow_taskFiles') || '{}'),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pvflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: 'Data exported successfully!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to export data' });
    }
  };
  
  const confirmAction = () => {
    if (actionType === 'reset') {
      apiService.resetToInitialData();
      setStatus({ type: 'success', message: 'Data reset to initial state!' });
    } else if (actionType === 'clear') {
      localStorage.clear();
      setStatus({ type: 'success', message: 'All data cleared!' });
      setTimeout(() => window.location.reload(), 1000);
    }
    setShowConfirm(false);
    setActionType(null);
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };
  
  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div className="settings-title">
          <Settings size={24} />
          <h2>Admin Settings</h2>
        </div>
        <p className="settings-description">
          System administration and data management tools
        </p>
      </div>
      
      {status.type && (
        <div className={`status-banner ${status.type}`}>
          {status.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {status.message}
        </div>
      )}
      
      <div className="settings-sections">
        {/* Database Management */}
        <div className="settings-section">
          <div className="section-header">
            <Database size={20} />
            <h3>Database Management</h3>
          </div>
          
          <div className="settings-card">
            <div className="card-info">
              <h4>Export Data</h4>
              <p>Download all application data as a JSON backup file</p>
            </div>
            <button className="action-btn" onClick={handleExportData}>
              <Download size={16} />
              Export Backup
            </button>
          </div>
          
          <div className="settings-card">
            <div className="card-info">
              <h4>Reset to Initial Data</h4>
              <p>Restore all data to the default sample data provided with the app</p>
            </div>
            <button className="action-btn warning" onClick={handleResetData}>
              <RefreshCw size={16} />
              Reset Data
            </button>
          </div>
          
          <div className="settings-card danger">
            <div className="card-info">
              <h4>Clear All Data</h4>
              <p>Permanently delete all tasks, projects, comments, and files. This cannot be undone.</p>
            </div>
            <button className="action-btn danger" onClick={handleClearAllData}>
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>
        </div>
        
        {/* System Info */}
        <div className="settings-section">
          <div className="section-header">
            <Info size={20} />
            <h3>System Information</h3>
          </div>
          
          <div className="settings-card info">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Version</span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">Environment</span>
                <span className="info-value">Development</span>
              </div>
              <div className="info-item">
                <span className="info-label">API Mode</span>
                <span className="info-value">Mock (localStorage)</span>
              </div>
              <div className="info-item">
                <span className="info-label">Storage</span>
                <span className="info-value">localStorage</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* About */}
        <div className="settings-section">
          <div className="section-header">
            <Settings size={20} />
            <h3>About PVFlow</h3>
          </div>
          
          <div className="settings-card about">
            <p>
              <strong>PVFlow</strong> is a comprehensive project management application 
              designed for creative teams to manage projects, track tasks, handle approvals, 
              and collaborate efficiently.
            </p>
            <p>
              Built with React, Vite, Zustand, and Lucide Icons.
            </p>
            <div className="tech-stack">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">Zustand</span>
              <span className="tech-badge">date-fns</span>
              <span className="tech-badge">Lucide</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertTriangle size={32} />
            </div>
            <h3>Confirm Action</h3>
            <p>
              {actionType === 'reset' && (
                'Are you sure you want to reset all data to the initial state? This will replace current data with default sample data.'
              )}
              {actionType === 'clear' && (
                'WARNING: This will permanently delete ALL data including tasks, projects, comments, and files. This action cannot be undone!'
              )}
            </p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button 
                className={`btn-confirm ${actionType}`}
                onClick={confirmAction}
              >
                {actionType === 'reset' ? 'Reset Data' : 'Clear All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;