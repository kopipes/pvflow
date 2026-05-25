import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { Search, Bell, Filter, Menu, Sun, Moon } from 'lucide-react';
import './Header.css';

function Header({ onMenuToggle }) {
  const { currentView } = useTaskStore();
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('pvflow-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pvflow-theme', newTheme);
  };
  
  const viewTitles = {
    dashboard: 'Dashboard',
    kanban: 'Kanban Board',
    timeline: 'Timeline',
    files: 'File Manager',
    team: 'Team Workload',
    users: 'User Management',
    divisions: 'Division Master',
  };
  
  const getViewTitle = () => viewTitles[currentView] || 'Dashboard';
  
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle mobile-only" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <h1 className="view-title">{getViewTitle()}</h1>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input type="text" className="search-input" placeholder="Search tasks, files..." />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>
      
      <div className="header-right">
        <button className="header-btn theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="header-btn"><Filter size={18} /></button>
        <button className="header-btn notification">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <div className="user-avatar-sm">AC</div>
      </div>
    </header>
  );
}

export default Header;