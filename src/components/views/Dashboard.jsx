import React from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';
import {
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  FileText,
  MessageSquare,
  Upload,
  FolderOpen,
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const { 
    tasks, 
    projects,
    divisions,
    users, 
    statuses, 
    priorities, 
    taskLogs, 
    setSelectedTask, 
    setCurrentView,
    currentUser 
  } = useTaskStore();
  
  // Check if user has admin/corporate privileges
  const isAdmin = () => currentUser.role === 'admin';
  const isCorporate = () => currentUser.role === 'corporate';
  
  const now = new Date();
  
  // Calculate metrics
  const activeTasks = tasks.filter(t => !['delivered', 'approved'].includes(t.status));
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || ['delivered', 'approved'].includes(t.status)) return false;
    return isBefore(new Date(t.due_date), now);
  });
  const awaitingApproval = tasks.filter(t => t.status === 'client' || t.status === 'review');
  const completedThisWeek = tasks.filter(t => {
    if (t.status !== 'delivered') return false;
    const weekAgo = addDays(now, -7);
    return isAfter(new Date(t.due_date), weekAgo);
  });
  
  // Get recent activity
  const allLogs = Object.entries(taskLogs)
    .flatMap(([taskId, logs]) => logs.map(log => ({ ...log, taskId })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
  
  // Get my tasks (tasks assigned to current user)
  const myTasks = tasks.filter(t => t.assignee_id === currentUser.id).slice(0, 5);
  
  // Team workload
  const teamWorkload = users.map(user => ({
    ...user,
    taskCount: tasks.filter(t => t.assignee_id === user.id && !['delivered', 'approved'].includes(t.status)).length,
    overdueCount: tasks.filter(t => t.assignee_id === user.id && t.due_date && isBefore(new Date(t.due_date), now) && t.status !== 'delivered').length,
  }));
  
  const getStatusColor = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    return status?.color || '#8b8fa3';
  };
  
  const getPriorityColor = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority?.color || '#8b8fa3';
  };
  
  const getUserById = (userId) => users.find(u => u.id === userId);
  const getStatusLabel = (statusId) => statuses.find(s => s.id === statusId)?.label || statusId;
  
  const getLogIcon = (action) => {
    switch (action) {
      case 'file': return <Upload size={14} />;
      case 'comment': return <MessageSquare size={14} />;
      case 'status': return <Activity size={14} />;
      default: return <FileText size={14} />;
    }
  };
  
  return (
    <div className="dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue">
            <Activity size={20} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{activeTasks.length}</div>
            <div className="metric-label">Active Tasks</div>
          </div>
        </div>
        
        <div className={`metric-card ${overdueTasks.length > 0 ? 'red' : ''}`}>
          <div className={`metric-icon ${overdueTasks.length > 0 ? 'red' : 'amber'}`}>
            <AlertCircle size={20} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{overdueTasks.length}</div>
            <div className="metric-label">Overdue</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon amber">
            <Clock size={20} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{awaitingApproval.length}</div>
            <div className="metric-label">Awaiting Approval</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{completedThisWeek.length}</div>
            <div className="metric-label">Completed This Week</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="text-btn" onClick={() => setCurrentView('timeline')}>
              View Timeline <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="activity-feed">
            {allLogs.map((log, idx) => {
              const task = tasks.find(t => t.id === log.taskId);
              const user = getUserById(log.user_id);
              return (
                <div key={log.id} className="activity-item" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="activity-icon">{getLogIcon(log.action)}</div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <span className="activity-user">{user?.name}</span>
                      {' '}{log.action === 'status' ? 'updated status' : log.action === 'file' ? 'uploaded file' : log.action === 'comment' ? 'commented' : 'created'}{' '}
                      <button className="activity-link" onClick={() => setSelectedTask(log.taskId)}>
                        {task?.title}
                      </button>
                    </div>
                    <div className="activity-time">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Tasks</h2>
            <button className="text-btn" onClick={() => setCurrentView('kanban')}>
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="my-tasks-list">
            {myTasks.map(task => (
              <button 
                key={task.id} 
                className="my-task-item"
                onClick={() => setSelectedTask(task.id)}
              >
                <div 
                  className="task-priority-dot"
                  style={{ background: getPriorityColor(task.priority) }}
                />
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span 
                      className="task-status"
                      style={{ color: getStatusColor(task.status) }}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                    {task.due_date && (
                      <span className={`task-due ${isBefore(new Date(task.due_date), now) ? 'overdue' : ''}`}>
                        Due {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {myTasks.length === 0 && (
              <div className="empty-state">No tasks assigned</div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Projects</h2>
            <button className="text-btn" onClick={() => setCurrentView('projects')}>
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="projects-list">
            {projects.slice(0, 4).map(project => {
              const projectTasks = tasks.filter(t => t.project_id === project.id);
              const activeTasks = projectTasks.filter(t => !['delivered', 'approved'].includes(t.status));
              const division = divisions.find(d => d.id === project.division_id);
              return (
                <button 
                  key={project.id} 
                  className="project-item"
                  onClick={() => setCurrentView('projects')}
                >
                  <div className="project-icon" style={{ background: project.color || '#6366f1' }}>
                    <FolderOpen size={16} />
                  </div>
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">
                      <span className="project-division">{division?.name || 'Unassigned'}</span>
                      <span className="project-tasks">{activeTasks.length} active tasks</span>
                    </div>
                  </div>
                </button>
              );
            })}
            {projects.length === 0 && (
              <div className="empty-state">No projects yet</div>
            )}
          </div>
        </div>
        
        {(isAdmin() || isCorporate()) && (
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h2>Team Workload</h2>
            </div>
            <div className="team-workload">
              {teamWorkload.map(user => {
                const userTasks = tasks.filter(t => t.assignee_id === user.id && !['delivered', 'approved'].includes(t.status));
                const userOverdueTasks = tasks.filter(t => 
                  t.assignee_id === user.id && 
                  t.due_date && 
                  isBefore(new Date(t.due_date), now) && 
                  !['delivered', 'approved'].includes(t.status)
                );
                
                return (
                  <div key={user.id} className="workload-item">
                    <div className="workload-user">
                      <div 
                        className="user-avatar-sm"
                        style={{ background: user.color }}
                      >
                        {user.initials}
                      </div>
                      <div className="workload-user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-role">{user.role}</div>
                      </div>
                    </div>
                    <div className="workload-stats">
                      <div className="workload-stat">
                        <span className="stat-value">{userTasks.length}</span>
                        <span className="stat-label">Active</span>
                      </div>
                      {userOverdueTasks.length > 0 && (
                        <div className="workload-stat overdue">
                          <span className="stat-value">{userOverdueTasks.length}</span>
                          <span className="stat-label">Overdue</span>
                        </div>
                      )}
                    </div>
                    
                    {userTasks.length > 0 && (
                      <div className="workload-tasks">
                        {userTasks.slice(0, 3).map(task => {
                          const project = projects.find(p => p.id === task.project_id);
                          const status = statuses.find(s => s.id === task.status);
                          
                          return (
                            <div key={task.id} className="workload-task-item" style={{ borderLeftColor: project?.color || '#ccc' }}>
                              <div className="task-item-header">
                                <span className="task-item-title">{task.title}</span>
                                {task.due_date && isBefore(new Date(task.due_date), now) && (
                                  <span className="task-item-overdue">Overdue</span>
                                )}
                              </div>
                              <div className="task-item-meta">
                                {project && (
                                  <span className="task-item-project">
                                    {project.name}
                                  </span>
                                )}
                                <span className="task-item-status" style={{ color: status?.color }}>
                                  {status?.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {userTasks.length > 3 && (
                          <div className="workload-task-more">
                            +{userTasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;