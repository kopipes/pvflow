import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { X, Mail, Lock, LogIn, User } from 'lucide-react';
import './LoginModal.css';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, loginAsDemo, isLoading, error, clearError, getAvailableUsers } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  
  const availableUsers = getAvailableUsers();
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      // Error is handled by the store
    }
  };
  
  const handleDemoLogin = async (userId) => {
    clearError();
    try {
      await loginAsDemo(userId);
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      // Error is handled by the store
    }
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
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container login-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Welcome to PVFlow</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {showDemo ? (
            <div className="demo-login">
              <h3>Quick Demo Login</h3>
              <p className="demo-info">Select a user role to explore different permission levels</p>
              <div className="demo-users">
                {availableUsers.map(user => (
                  <button
                    key={user.id}
                    className="demo-user-btn"
                    onClick={() => handleDemoLogin(user.id)}
                  >
                    <div 
                      className="demo-avatar"
                      style={{ background: user.color }}
                    >
                      {user.initials}
                    </div>
                    <div className="demo-user-info">
                      <div className="demo-user-name">{user.name}</div>
                      <div 
                        className="demo-user-role"
                        style={{ color: getRoleBadgeColor(user.role) }}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                className="back-to-email"
                onClick={() => setShowDemo(false)}
              >
                ← Back to Email Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-primary login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
              
              <div className="divider">
                <span>or</span>
              </div>
              
              <button 
                type="button" 
                className="btn-secondary demo-btn"
                onClick={() => setShowDemo(true)}
              >
                <User size={18} />
                Quick Demo Login
              </button>
            </form>
          )}
        </div>
        
        <div className="modal-footer">
          <p className="login-footer-text">
            PVFlow v1.0 - Project & Task Management
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;