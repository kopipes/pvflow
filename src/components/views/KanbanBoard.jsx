import React from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format, isBefore } from 'date-fns';
import { Clock, AlertCircle, Paperclip, Lock } from 'lucide-react';
import './KanbanBoard.css';

function KanbanBoard() {
  const { 
    statuses, 
    priorities, 
    users, 
    projects,
    setSelectedTask, 
    updateTaskStatus,
    getFilteredTasks,
    taskFiles,
  } = useTaskStore();
  
  const now = new Date();
  
  // Get filtered tasks based on user role
  const accessibleTasks = getFilteredTasks();
  
  const getTasksByStatus = (statusId) => {
    return accessibleTasks.filter(t => t.status === statusId);
  };
  
  const getUserById = (userId) => users.find(u => u.id === userId);
  const getPriorityColor = (priorityId) => priorities.find(p => p.id === priorityId)?.color || '#8b8fa3';
  const getPriorityLabel = (priorityId) => priorities.find(p => p.id === priorityId)?.label || priorityId;
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || null;
  };
  const getProjectColor = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#8b8fa3';
  };
  
  const isOverdue = (task) => {
    if (!task.due_date || ['delivered', 'approved'].includes(task.status)) return false;
    return isBefore(new Date(task.due_date), now);
  };
  
  const isDueSoon = (task) => {
    if (!task.due_date || isOverdue(task)) return false;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isBefore(new Date(task.due_date), tomorrow);
  };
  
  const getTaskFilesCount = (taskId) => {
    return taskFiles[taskId]?.length || 0;
  };
  
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task.id);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, statusId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, statusId);
    }
  };
  
  return (
    <div className="kanban-board">
      {statuses.map(status => (
        <div 
          key={status.id} 
          className="kanban-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status.id)}
        >
          <div className="column-header">
            <div className="column-title">
              <div 
                className="status-dot"
                style={{ background: status.color }}
              />
              <span>{status.label}</span>
            </div>
            <span className="column-count">{getTasksByStatus(status.id).length}</span>
          </div>
          
          <div className="column-content">
            {getTasksByStatus(status.id).map((task, idx) => {
              const assignee = getUserById(task.assignee_id);
              const overdue = isOverdue(task);
              const dueSoon = isDueSoon(task);
              
              return (
                <div
                  key={task.id}
                  className={`kanban-card ${overdue ? 'overdue' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => setSelectedTask(task.id)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div 
                    className="card-priority"
                    style={{ background: getPriorityColor(task.priority) }}
                  />
                  
                  {task.dependencies?.length > 0 && (
                    <div className="card-lock">
                      <Lock size={12} />
                    </div>
                  )}
                  
                  <div className="card-content">
                    <div className="card-title">{task.title}</div>
                    {task.project_id && (
                      <div className="card-project">
                        <span 
                          className="project-dot"
                          style={{ background: getProjectColor(task.project_id) }}
                        />
                        {getProjectName(task.project_id)}
                      </div>
                    )}
                    
                    <div className="card-meta">
                      <span 
                        className="card-priority-badge"
                        style={{ color: getPriorityColor(task.priority) }}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                      {task.due_date && (
                        <span className={`card-due ${overdue ? 'overdue' : dueSoon ? 'soon' : ''}`}>
                          {overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      {assignee ? (
                        <div 
                          className="card-assignee"
                          style={{ background: assignee.color }}
                          title={assignee.name}
                        >
                          {assignee.initials}
                        </div>
                      ) : (
                        <div className="card-assignee unassigned">?</div>
                      )}
                      
                      <div className="card-badges">
                        {getTaskFilesCount(task.id) > 0 && (
                          <span className="card-badge">
                            <Paperclip size={12} />
                            {getTaskFilesCount(task.id)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {getTasksByStatus(status.id).length === 0 && (
              <div className="column-empty">
                <span>No tasks</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KanbanBoard;