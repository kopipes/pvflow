import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format, isBefore, isAfter, addDays } from 'date-fns';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import './TeamWorkload.css';

function TeamWorkload() {
  const { tasks, users, statuses, priorities, setSelectedTask } = useTaskStore();
  const [selectedUser, setSelectedUser] = useState(null);
  
  const now = new Date();
  
  // Calculate workload for each user
  const teamStats = users.map(user => {
    const userTasks = tasks.filter(t => t.assignee_id === user.id);
    const activeTasks = userTasks.filter(t => !['delivered', 'approved'].includes(t.status));
    const overdueTasks = userTasks.filter(t => {
      if (!t.due_date || ['delivered', 'approved'].includes(t.status)) return false;
      return isBefore(new Date(t.due_date), now);
    });
    const inReviewTasks = userTasks.filter(t => t.status === 'client' || t.status === 'review');
    const completedTasks = userTasks.filter(t => t.status === 'delivered' || t.status === 'approved');
    
    // Calculate average completion time (mock)
    const completedWithDates = completedTasks.filter(t => t.due_date);
    const avgCompletion = completedWithDates.length > 0 
      ? (completedWithDates.reduce((sum, t) => sum + (t.actual_hours || 0), 0) / completedWithDates.length).toFixed(1)
      : 0;
    
    // Get current task (most recent active task)
    const currentTask = activeTasks.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0];
    
    // Workload indicator
    const workloadLevel = activeTasks.length > 5 ? 'high' : activeTasks.length > 3 ? 'medium' : 'low';
    
    return {
      ...user,
      activeTasks,
      overdueTasks,
      inReviewTasks,
      completedTasks,
      totalTasks: userTasks.length,
      overdueCount: overdueTasks.length,
      inReviewCount: inReviewTasks.length,
      avgCompletion,
      currentTask,
      workloadLevel,
    };
  });
  
  const selectedUserStats = selectedUser 
    ? teamStats.find(u => u.id === selectedUser) 
    : null;
  
  const getStatusColor = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    return status?.color || '#8b8fa3';
  };
  
  const getStatusLabel = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    return status?.label || statusId;
  };
  
  const getPriorityColor = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority?.color || '#8b8fa3';
  };
  
  // Team totals
  const totalActiveTasks = teamStats.reduce((sum, u) => sum + u.activeTasks.length, 0);
  const totalOverdue = teamStats.reduce((sum, u) => sum + u.overdueCount, 0);
  
  return (
    <div className="team-workload-view">
      <div className="workload-header">
        <div className="header-title">
          <Users size={24} />
          <h1>Team Workload</h1>
        </div>
        <div className="team-summary">
          <div className="summary-stat">
            <span className="stat-value">{totalActiveTasks}</span>
            <span className="stat-label">Active Tasks</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value overdue">{totalOverdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{teamStats.length}</span>
            <span className="stat-label">Team Members</span>
          </div>
        </div>
      </div>
      
      <div className="workload-content">
        <div className="team-grid">
          {teamStats.map(user => (
            <div 
              key={user.id}
              className={`team-card ${selectedUser === user.id ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user.id === selectedUser ? null : user.id)}
            >
              <div className="card-header">
                <div 
                  className="user-avatar"
                  style={{ background: user.color }}
                >
                  {user.initials}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role}</div>
                </div>
                <div className={`workload-indicator ${user.workloadLevel}`}>
                  {user.workloadLevel === 'high' ? (
                    <AlertTriangle size={16} />
                  ) : user.workloadLevel === 'medium' ? (
                    <Clock size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                </div>
              </div>
              
              <div className="card-stats">
                <div className="stat">
                  <span className="stat-num">{user.activeTasks.length}</span>
                  <span className="stat-desc">Active</span>
                </div>
                {user.overdueCount > 0 && (
                  <div className="stat overdue">
                    <span className="stat-num">{user.overdueCount}</span>
                    <span className="stat-desc">Overdue</span>
                  </div>
                )}
                {user.inReviewCount > 0 && (
                  <div className="stat">
                    <span className="stat-num">{user.inReviewCount}</span>
                    <span className="stat-desc">In Review</span>
                  </div>
                )}
              </div>
              
              {user.currentTask && (
                <div className="current-task">
                  <div className="current-label">Current Task</div>
                  <div className="current-title">{user.currentTask.title}</div>
                  <div className="current-status">
                    <span style={{ color: getStatusColor(user.currentTask.status) }}>
                      {getStatusLabel(user.currentTask.status)}
                    </span>
                    {user.currentTask.due_date && (
                      <span className={`due ${isBefore(new Date(user.currentTask.due_date), now) ? 'overdue' : ''}`}>
                        Due {format(new Date(user.currentTask.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="workload-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${Math.min(user.activeTasks.length / 10 * 100, 100)}%`,
                    background: user.workloadLevel === 'high' ? 'var(--accent-red)' 
                      : user.workloadLevel === 'medium' ? 'var(--accent-amber)' 
                      : 'var(--accent-green)'
                  }}
                />
              </div>
              
              <div className="card-footer">
                <span className="avg-completion">
                  <TrendingUp size={12} />
                  Avg: {user.avgCompletion}h
                </span>
                <ChevronRight size={16} className="expand-icon" />
              </div>
            </div>
          ))}
        </div>
        
        {selectedUserStats && (
          <div className="user-detail-panel">
            <div className="detail-header">
              <div 
                className="user-avatar lg"
                style={{ background: selectedUserStats.color }}
              >
                {selectedUserStats.initials}
              </div>
              <div className="detail-user-info">
                <h2>{selectedUserStats.name}</h2>
                <span className="role">{selectedUserStats.role}</span>
              </div>
            </div>
            
            <div className="detail-sections">
              <div className="detail-section">
                <h3>
                  <AlertTriangle size={16} />
                  Overdue Tasks ({selectedUserStats.overdueCount})
                </h3>
                <div className="task-list">
                  {selectedUserStats.overdueTasks.length === 0 ? (
                    <div className="empty-message">No overdue tasks</div>
                  ) : (
                    selectedUserStats.overdueTasks.map(task => (
                      <button 
                        key={task.id}
                        className="task-item overdue"
                        onClick={() => setSelectedTask(task.id)}
                      >
                        <div 
                          className="task-priority"
                          style={{ background: getPriorityColor(task.priority) }}
                        />
                        <div className="task-info">
                          <div className="task-title">{task.title}</div>
                          <div className="task-due">
                            Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <ChevronRight size={16} />
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              <div className="detail-section">
                <h3>
                  <Clock size={16} />
                  In Progress ({selectedUserStats.activeTasks.length})
                </h3>
                <div className="task-list">
                  {selectedUserStats.activeTasks.map(task => (
                    <button 
                      key={task.id}
                      className="task-item"
                      onClick={() => setSelectedTask(task.id)}
                    >
                      <div 
                        className="task-priority"
                        style={{ background: getPriorityColor(task.priority) }}
                      />
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span style={{ color: getStatusColor(task.status) }}>
                            {getStatusLabel(task.status)}
                          </span>
                          {task.due_date && (
                            <span className={`due ${isBefore(new Date(task.due_date), now) ? 'overdue' : ''}`}>
                              Due {format(new Date(task.due_date), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="detail-section">
                <h3>
                  <CheckCircle2 size={16} />
                  Completed ({selectedUserStats.completedTasks.length})
                </h3>
                <div className="task-list">
                  {selectedUserStats.completedTasks.length === 0 ? (
                    <div className="empty-message">No completed tasks yet</div>
                  ) : (
                    selectedUserStats.completedTasks.slice(0, 5).map(task => (
                      <button 
                        key={task.id}
                        className="task-item completed"
                        onClick={() => setSelectedTask(task.id)}
                      >
                        <div className="task-info">
                          <div className="task-title">{task.title}</div>
                          <div className="task-meta">
                            <span style={{ color: getStatusColor(task.status) }}>
                              {getStatusLabel(task.status)}
                            </span>
                            <span>{task.actual_hours}h</span>
                          </div>
                        </div>
                        <ChevronRight size={16} />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamWorkload;