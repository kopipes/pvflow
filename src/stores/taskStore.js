import { create } from 'zustand';
import { 
  divisions, 
  users, 
  statuses, 
  priorities, 
  projects,
  initialTasks, 
  initialComments, 
  initialTaskLogs, 
  initialTaskFiles 
} from '../data/mockData';

// Storage key
const STORAGE_KEY = 'pvflow-state';

// Load persisted state from localStorage - with validation
const loadPersistedState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState && savedState.trim()) {
      const parsed = JSON.parse(savedState);
      // Validate structure
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load persisted state, using defaults:', e.message);
    // Clear corrupted data
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
  return null;
};

// Get initial persisted state with fallback to defaults
const persistedState = loadPersistedState();

export const useTaskStore = create((set, get) => ({
  // Data - use persisted state if available and valid, otherwise use initial data
  tasks: (persistedState?.tasks && Array.isArray(persistedState.tasks)) ? persistedState.tasks : initialTasks,
  projects: (persistedState?.projects && Array.isArray(persistedState.projects)) ? persistedState.projects : projects,
  comments: (persistedState?.comments && typeof persistedState.comments === 'object') ? persistedState.comments : initialComments,
  taskLogs: (persistedState?.taskLogs && typeof persistedState.taskLogs === 'object') ? persistedState.taskLogs : initialTaskLogs,
  taskFiles: (persistedState?.taskFiles && typeof persistedState.taskFiles === 'object') ? persistedState.taskFiles : initialTaskFiles,
  
  // Data - mutable users and divisions for CRUD operations
  users: (persistedState?.users && Array.isArray(persistedState.users)) ? persistedState.users : users,
  divisions: (persistedState?.divisions && Array.isArray(persistedState.divisions)) ? persistedState.divisions : divisions,
  statuses: statuses,
  priorities: priorities,
  
  // Current user (simulated login) - always default (fallback to first user)
  currentUser: (persistedState?.currentUser && persistedState.currentUser?.id) 
    ? persistedState.currentUser 
    : users[0],
  
  // View state
  currentView: persistedState?.currentView || 'dashboard',
  selectedTaskId: null,
  selectedTaskSource: null,
  
  // Pending approvals
  pendingApprovals: {},
  
  // Debounced persist function to avoid blocking
  _persistState: (() => {
    let timeout = null;
    return () => {
      if (timeout) clearTimeout(timeout);
      // Use setTimeout to defer the localStorage write (non-blocking)
      timeout = setTimeout(() => {
        try {
          const state = get();
          // Only persist essential data, not every state change
          const toPersist = {
            tasks: state.tasks,
            projects: state.projects,
            comments: state.comments,
            taskLogs: state.taskLogs,
            taskFiles: state.taskFiles,
            currentView: state.currentView,
            currentUser: state.currentUser,
            users: state.users,
            divisions: state.divisions,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
        } catch (e) {
          console.warn('Failed to persist state:', e.message);
        }
      }, 100);
    };
  })(),
  
  // Actions
  setCurrentUser: (userId) => {
    const user = get().users.find(u => u.id === userId);
    if (user) {
      set({ currentUser: user });
      get()._persistState();
    }
  },
  
  setCurrentView: (view) => {
    set({ currentView: view });
    // Debounced persistence
    get()._persistState();
  },
  
  setSelectedTask: (taskId, source = null) => set({ selectedTaskId: taskId, selectedTaskSource: source }),
  
  // Role checks
  isAdmin: () => get().currentUser?.role === 'admin',
  isCorporate: () => get().currentUser?.role === 'corporate',
  isManager: () => get().currentUser?.role === 'manager',
  isSpv: () => get().currentUser?.role === 'spv',
  isUser: () => get().currentUser?.role === 'user',
  
  // Projects CRUD
  addProject: (project) => {
    const newProject = {
      ...project,
      id: `proj-${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    set(state => ({ projects: [...state.projects, newProject] }));
    get()._persistState();
    return newProject;
  },
  
  updateProject: (projectId, updates) => {
    set(state => ({
      projects: state.projects.map(p => 
        p.id === projectId ? { ...p, ...updates } : p
      )
    }));
    get()._persistState();
  },
  
  deleteProject: (projectId) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== projectId)
    }));
    get()._persistState();
  },
  
  getProjectsByDivision: (divisionId) => {
    const { projects, currentUser } = get();
    // Admin/Corporate see all, others see their division
    if (currentUser.role === 'admin' || currentUser.role === 'corporate') {
      return divisionId ? projects.filter(p => p.division_id === divisionId) : projects;
    }
    return projects.filter(p => p.division_id === currentUser.division_id);
  },
  
  // Tasks CRUD
  addTask: (taskData) => {
    const { currentUser } = get();
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set(state => ({ tasks: [...state.tasks, newTask] }));
    
    // Add to activity log
    get().addLog(newTask.id, 'created', 'Task created');
    
    // Persist state
    get()._persistState();
    
    return newTask;
  },
  
  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )
    }));
    get()._persistState();
  },
  
  deleteTask: (taskId) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
      selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId
    }));
    get()._persistState();
  },
  
  getTasksByProject: (projectId) => {
    return get().tasks.filter(t => t.project_id === projectId);
  },
  
  // Filter tasks based on role
  getFilteredTasks: () => {
    const { tasks, currentUser } = get();
    
    if (currentUser.role === 'admin' || currentUser.role === 'corporate') {
      return tasks;
    }
    
    if (currentUser.role === 'manager') {
      return tasks.filter(t => t.division_id === currentUser.division_id);
    }
    
    if (currentUser.role === 'spv') {
      return tasks.filter(t => 
        t.division_id === currentUser.division_id || 
        t.assignee_id === currentUser.id ||
        t.created_by === currentUser.id
      );
    }
    
    // Regular user - only assigned tasks
    return tasks.filter(t => t.assignee_id === currentUser.id);
  },
  
  // Alias for getFilteredTasks for compatibility
  getAccessibleTasks: () => {
    return get().getFilteredTasks();
  },
  
  // Status pipeline
  updateTaskStatus: (taskId, newStatus) => {
    const { currentUser, tasks, addLog } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if approval is required for this status change
    const currentStatusIndex = statuses.findIndex(s => s.id === task.status);
    const newStatusIndex = statuses.findIndex(s => s.id === newStatus);
    
    // Only require approval when moving forward
    if (newStatusIndex > currentStatusIndex && 
        (currentUser.role === 'spv' || currentUser.role === 'user')) {
      // Request approval instead of directly changing
      set(state => ({
        pendingApprovals: {
          ...state.pendingApprovals,
          [taskId]: {
            taskId,
            currentStatus: task.status,
            requestedStatus: newStatus,
            requestedBy: currentUser.id,
            requestedAt: new Date().toISOString()
          }
        }
      }));
      addLog(taskId, 'approval_request', `Requested approval to move to ${statuses.find(s => s.id === newStatus)?.label}`);
      return;
    }
    
    // Direct change for managers and above
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
      )
    }));
    addLog(taskId, 'status', `Status changed to ${statuses.find(s => s.id === newStatus)?.label}`);
  },
  
  approveStatusChange: (taskId) => {
    const { pendingApprovals, tasks } = get();
    const approval = pendingApprovals[taskId];
    if (!approval) return;
    
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, status: approval.requestedStatus, updated_at: new Date().toISOString() } : t
      ),
      pendingApprovals: Object.fromEntries(
        Object.entries(state.pendingApprovals).filter(([key]) => key !== taskId)
      )
    }));
    get().addLog(taskId, 'approved', `Status change approved`);
  },
  
  rejectStatusChange: (taskId) => {
    set(state => ({
      pendingApprovals: Object.fromEntries(
        Object.entries(state.pendingApprovals).filter(([key]) => key !== taskId)
      )
    }));
    get().addLog(taskId, 'rejected', `Status change rejected`);
  },
  
  getPendingApproval: (taskId) => {
    return get().pendingApprovals[taskId];
  },
  
  getPendingApprovals: () => {
    const { pendingApprovals, tasks, users } = get();
    return Object.values(pendingApprovals).map(approval => {
      const task = tasks.find(t => t.id === approval.taskId);
      const requester = users.find(u => u.id === approval.requestedBy);
      return { ...approval, task, requester };
    });
  },
  
  // Comments
  addComment: (taskId, content) => {
    const { currentUser } = get();
    const newComment = {
      id: `comment-${Date.now()}`,
      user_id: currentUser.id,
      content,
      created_at: new Date().toISOString(),
      replies: []
    };
    
    set(state => {
      const taskComments = state.comments[taskId] || [];
      return {
        comments: {
          ...state.comments,
          [taskId]: [...taskComments, newComment]
        }
      };
    });
    
    get().addLog(taskId, 'comment', 'Added a comment');
  },
  
  // File management
  addFile: (taskId, fileData) => {
    const { currentUser } = get();
    const newFile = {
      ...fileData,
      id: `file-${Date.now()}`,
      uploaded_by: currentUser.id,
      uploaded_at: new Date().toISOString(),
    };
    
    set(state => {
      const taskFiles = state.taskFiles[taskId] || [];
      return {
        taskFiles: {
          ...state.taskFiles,
          [taskId]: [...taskFiles, newFile]
        }
      };
    });
    
    get().addLog(taskId, 'file', `Uploaded ${fileData.filename}`);
    return newFile;
  },
  
  // Activity logs
  addLog: (taskId, action, notes) => {
    const { currentUser } = get();
    const newLog = {
      id: `log-${Date.now()}`,
      user_id: currentUser.id,
      action,
      notes,
      timestamp: new Date().toISOString()
    };
    
    set(state => {
      const taskLogs = state.taskLogs[taskId] || [];
      return {
        taskLogs: {
          ...state.taskLogs,
          [taskId]: [newLog, ...taskLogs]
        }
      };
    });
  },
  
  // Task assignment
  reassignTask: (taskId, newAssigneeId) => {
    const { users } = get();
    const newAssignee = users.find(u => u.id === newAssigneeId);
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, assignee_id: newAssigneeId, updated_at: new Date().toISOString() } : t
      )
    }));
    get().addLog(taskId, 'status', `Reassigned to ${newAssignee?.name}`);
  },
  
  // Permission checks
  canEditTask: (task) => {
    const { currentUser } = get();
    if (!task) return false;
    
    if (currentUser.role === 'admin' || currentUser.role === 'corporate') return true;
    if (currentUser.role === 'manager' && task.division_id === currentUser.division_id) return true;
    if (task.assignee_id === currentUser.id || task.created_by === currentUser.id) return true;
    return false;
  },
  
  getAssignableUsers: (task) => {
    const { users, currentUser } = get();
    
    // Admin/Corporate can assign to anyone
    if (currentUser.role === 'admin' || currentUser.role === 'corporate') {
      return users;
    }
    
    // Manager/Spv can assign to users in same division
    if (currentUser.role === 'manager' || currentUser.role === 'spv') {
      return users.filter(u => 
        u.division_id === currentUser.division_id || 
        u.role === 'user'
      );
    }
    
    // Regular users can't assign
    return [];
  },
  
  canManageUsers: () => {
    const { currentUser } = get();
    return currentUser.role === 'admin' || currentUser.role === 'corporate';
  },
  
  canManageDivisions: () => {
    const { currentUser } = get();
    return currentUser.role === 'admin' || currentUser.role === 'corporate';
  },
  
  canAccessAdminSettings: () => {
    const { currentUser } = get();
    return currentUser.role === 'admin' || currentUser.role === 'corporate';
  },
  
  // Users CRUD
  addUser: (userData) => {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      initials: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
    set(state => ({ users: [...state.users, newUser] }));
    get()._persistState();
    return newUser;
  },
  
  updateUser: (userId, updates) => {
    set(state => ({
      users: state.users.map(u => {
        if (u.id !== userId) return u;
        const updated = { ...u, ...updates };
        if (updates.name) {
          updated.initials = updates.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return updated;
      })
    }));
    get()._persistState();
  },
  
  deleteUser: (userId) => {
    set(state => ({
      users: state.users.filter(u => u.id !== userId),
      currentUser: state.currentUser.id === userId ? state.users[0] : state.currentUser
    }));
    get()._persistState();
  },
  
  // Divisions CRUD
  addDivision: (divisionData) => {
    const newDivision = {
      ...divisionData,
      id: `div_${Date.now()}`,
    };
    set(state => ({ divisions: [...state.divisions, newDivision] }));
    get()._persistState();
    return newDivision;
  },
  
  updateDivision: (divisionId, updates) => {
    set(state => ({
      divisions: state.divisions.map(d => 
        d.id === divisionId ? { ...d, ...updates } : d
      )
    }));
    get()._persistState();
  },
  
  deleteDivision: (divisionId) => {
    set(state => ({
      divisions: state.divisions.filter(d => d.id !== divisionId)
    }));
    get()._persistState();
  },
}));
