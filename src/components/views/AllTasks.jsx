import React from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format } from 'date-fns';
import {
  LayoutGrid,
  Clock,
  Tag,
  User,
  Filter,
  Search,
} from 'lucide-react';
import './AllTasks.css';

function AllTasks() {
  const { 
    tasks, 
    users, 
    statuses, 
    priorities, 
    projects, 
    divisions,
    getFilteredTasks,
    setSelectedTask, 
    setCurrentView 
  } = useTaskStore();

  // Get filtered tasks based on user role
  const filteredTasks = getFilteredTasks();

  // Group tasks by project
  const tasksByProject = projects.map(project => ({
    ...project,
    tasks: filteredTasks.filter(t => t.project_id === project.id)
  }));

  const getAssignee = (assigneeId) => users.find(u => u.id === assigneeId);
  const getStatus = (statusId) => statuses.find(s => s.id === statusId);
  const getPriority = (priorityId) => priorities.find(p => p.id === priorityId);
  const getDivision = (divisionId) => divisions.find(d => d.id === divisionId);

  const handleTaskClick = (taskId) => {
    setSelectedTask(taskId);
    setCurrentView('kanban');
  };

  return (
    <div className="all-tasks-view">
      <div className="all-tasks-header">
        <div className="header-title">
          <LayoutGrid size={24} />
          <h2>All Tasks</h2>
        </div>
        <p className="header-description">
          View all tasks organized by project
        </p>
      </div>
      
      <div className="projects-tasks-list">
        {tasksByProject.map(project => (
          <div key={project.id} className="project-group">
            <div className="project-header">
              <div 
                className="project-color"
                style={{ background: project.color }}
              />
              <div className="project-info">
                <h3>{project.name}</h3>
                <span className="project-client">{project.client}</span>
              </div>
              <span className="task-count">{project.tasks.length} tasks</span>
            </div>
            
            {project.tasks.length > 0 ? (
              <div className="tasks-list">
                {project.tasks.map(task => {
                  const assignee = getAssignee(task.assignee_id);
                  const status = getStatus(task.status);
                  const priority = getPriority(task.priority);
                  
                  return (
                    <div 
                      key={task.id} 
                      className="task-row"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="task-main">
                        <span className="task-id">#{task.id}</span>
                        <h4 className="task-title">{task.title}</h4>
                      </div>
                      
                      <div className="task-status">
                        <span 
                          className="status-badge"
                          style={{ background: status?.color }}
                        >
                          {status?.label}
                        </span>
                      </div>
                      
                      <div className="task-assignee">
                        {assignee ? (
                          <>
                            <div 
                              className="assignee-avatar"
                              style={{ background: assignee.color }}
                            >
                              {assignee.initials}
                            </div>
                            <span>{assignee.name}</span>
                          </>
                        ) : (
                          <span className="unassigned">Unassigned</span>
                        )}
                      </div>
                      
                      <div className="task-due">
                        {task.due_date ? (
                          <>
                            <Clock size={14} />
                            {format(new Date(task.due_date), 'MMM d')}
                          </>
                        ) : (
                          <span className="no-date">No deadline</span>
                        )}
                      </div>
                      
                      <div className="task-priority">
                        <span style={{ color: priority?.color }}>
                          {priority?.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-tasks">
                <p>No tasks in this project</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllTasks;
