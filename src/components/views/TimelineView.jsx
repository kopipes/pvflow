import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format, formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Upload,
  MessageSquare,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import './TimelineView.css';

function TimelineView() {
  const { tasks, taskLogs, users, statuses, setSelectedTask } = useTaskStore();
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  
  // Build timeline from all logs
  const allLogs = Object.entries(taskLogs)
    .flatMap(([taskId, logs]) => 
      logs.map(log => ({
        ...log,
        taskId,
        task: tasks.find(t => t.id === taskId)
      }))
    )
    .filter(log => {
      if (filterUser !== 'all' && log.user_id !== filterUser) return false;
      if (filterAction !== 'all' && log.action !== filterAction) return false;
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Group by date
  const groupedLogs = allLogs.reduce((acc, log) => {
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});
  
  const getUserById = (userId) => users.find(u => u.id === userId);
  
  const getLogIcon = (action) => {
    switch (action) {
      case 'file': return <Upload size={16} />;
      case 'comment': return <MessageSquare size={16} />;
      case 'status': return <Activity size={16} />;
      case 'created': return <FileText size={16} />;
      case 'assigned': return <ArrowRight size={16} />;
      default: return <Clock size={16} />;
    }
  };
  
  const getLogColor = (action) => {
    switch (action) {
      case 'file': return 'var(--accent-blue)';
      case 'comment': return 'var(--accent-amber)';
      case 'status': return 'var(--accent-purple)';
      case 'approved': return 'var(--accent-green)';
      default: return 'var(--text-muted)';
    }
  };
  
  const formatGroupDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  };
  
  return (
    <div className="timeline-view">
      <div className="timeline-filters">
        <select 
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Team Members</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        
        <select 
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Activities</option>
          <option value="created">Task Created</option>
          <option value="assigned">Task Assigned</option>
          <option value="status">Status Changed</option>
          <option value="file">File Uploaded</option>
          <option value="comment">Comment Added</option>
        </select>
      </div>
      
      <div className="timeline-content">
        {Object.entries(groupedLogs).map(([date, logs]) => (
          <div key={date} className="timeline-group">
            <div className="timeline-date">{formatGroupDate(date)}</div>
            
            <div className="timeline-entries">
              {logs.map((log, idx) => {
                const user = getUserById(log.user_id);
                return (
                  <div 
                    key={log.id} 
                    className="timeline-entry"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="entry-time">
                      {format(new Date(log.timestamp), 'HH:mm')}
                    </div>
                    
                    <div className="entry-line">
                      <div 
                        className="entry-dot"
                        style={{ background: getLogColor(log.action) }}
                      >
                        {getLogIcon(log.action)}
                      </div>
                    </div>
                    
                    <div className="entry-content">
                      <div className="entry-header">
                        <div 
                          className="entry-user-avatar"
                          style={{ background: user?.color }}
                        >
                          {user?.initials}
                        </div>
                        <div className="entry-user-name">{user?.name}</div>
                        <div className="entry-action-type">{log.action}</div>
                      </div>
                      
                      {log.task && (
                        <button 
                          className="entry-task-link"
                          onClick={() => setSelectedTask(log.taskId)}
                        >
                          {log.task.title}
                        </button>
                      )}
                      
                      {log.notes && (
                        <div className="entry-notes">{log.notes}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {allLogs.length === 0 && (
          <div className="timeline-empty">
            <Clock size={48} />
            <p>No activities found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimelineView;