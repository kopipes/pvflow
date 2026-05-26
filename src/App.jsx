import React, { useState } from 'react';
import { useTaskStore } from './stores/taskStore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/views/Dashboard';
import KanbanBoard from './components/views/KanbanBoard';
import TimelineView from './components/views/TimelineView';
import CalendarView from './components/views/CalendarView';
import AdminSettings from './components/views/AdminSettings';
import FileManager from './components/views/FileManager';
import TeamWorkload from './components/views/TeamWorkload';
import UserManagement from './components/views/UserManagement';
import DivisionMaster from './components/views/DivisionMaster';
import Projects from './components/views/Projects';
import AllTasks from './components/views/AllTasks';
import TaskDetailPanel from './components/features/TaskDetailPanel';
import NewTaskModal from './components/features/NewTaskModal';
import EditTaskModal from './components/features/EditTaskModal';
import ProjectModal from './components/features/ProjectModal';
import AIFeedbackImport from './components/features/AIFeedbackImport';
import FileUpload from './components/features/FileUpload';
import { Menu } from 'lucide-react';
import './App.css';

function App() {
  const { currentView, selectedTaskId, setSelectedTask, tasks } = useTaskStore();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAIFeedbackImport, setShowAIFeedbackImport] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadTaskId, setUploadTaskId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // File upload handler
  const handleUploadFile = (taskId) => {
    setUploadTaskId(taskId);
    setShowFileUpload(true);
  };
  
  // Get selected task for edit modal
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  
  // Listen to sidebar actions
  const handleNewTask = () => setShowNewTaskModal(true);
  const handleNewProject = () => setShowProjectModal(true);
  const handleAIFeedback = () => setShowAIFeedbackImport(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'timeline':
        return <TimelineView />;
      case 'files':
        return <FileManager />;
      case 'team':
        return <TeamWorkload />;
      case 'calendar':
        return <CalendarView />;
      case 'users':
        return <UserManagement />;
      case 'divisions':
        return <DivisionMaster />;
      case 'projects':
        return <Projects />;
      case 'all-tasks':
        return <AllTasks />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <Dashboard />;
    }
  };
  
  // When clicking task from Kanban, show full detail view
  const isTaskDetailView = selectedTaskId && currentView === 'kanban';
  
  return (
    <div className="app">
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Mobile header */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>PVFlow</span>
        </div>
        <button className="menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>
      
      <Sidebar 
        onNewTask={handleNewTask}
        onNewProject={handleNewProject}
        onAIFeedback={handleAIFeedback}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <Header onMenuToggle={toggleSidebar} />
        
        {isTaskDetailView ? (
          <div className="view-container task-detail-view">
            <TaskDetailPanel 
              taskId={selectedTaskId} 
              isFullPage={true}
              onBack={() => setSelectedTask(null)}
              onEdit={() => setShowEditTaskModal(true)}
              onUploadFile={handleUploadFile}
            />
          </div>
        ) : (
          <div className="view-container">
            <div className="view-main">
              {renderView()}
            </div>
            {selectedTaskId && currentView !== 'kanban' && (
              <TaskDetailPanel 
                taskId={selectedTaskId} 
                onEdit={() => setShowEditTaskModal(true)}
                onUploadFile={handleUploadFile}
              />
            )}
          </div>
        )}
      </main>
      
      {showNewTaskModal && (
        <NewTaskModal 
          isOpen={showNewTaskModal} 
          onClose={() => setShowNewTaskModal(false)} 
        />
      )}
      
      {showAIFeedbackImport && (
        <AIFeedbackImport 
          isOpen={showAIFeedbackImport} 
          onClose={() => setShowAIFeedbackImport(false)} 
        />
      )}
      
      {showEditTaskModal && selectedTask && (
        <EditTaskModal 
          isOpen={showEditTaskModal}
          onClose={() => setShowEditTaskModal(false)}
          task={selectedTask}
        />
      )}
      
      {showProjectModal && (
        <ProjectModal 
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
        />
      )}
      
      {showFileUpload && uploadTaskId && (
        <FileUpload 
          isOpen={showFileUpload}
          onClose={() => {
            setShowFileUpload(false);
            setUploadTaskId(null);
          }}
          taskId={uploadTaskId}
        />
      )}
    </div>
  );
}

export default App;