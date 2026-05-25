// API Service Layer for PVFlow
// This module provides a unified API interface for all data operations
// Currently uses localStorage as backend simulation, but can be swapped for real API

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK_API = true; // Set to false when real backend is available

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Storage keys
const STORAGE_KEYS = {
  tasks: 'pvflow_tasks',
  comments: 'pvflow_comments',
  taskLogs: 'pvflow_logs',
  taskFiles: 'pvflow_files',
  projects: 'pvflow_projects',
};

// Initialize storage with mock data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.tasks)) {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(initialTasks));
  }
  if (!localStorage.getItem(STORAGE_KEYS.comments)) {
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(initialComments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.taskLogs)) {
    localStorage.setItem(STORAGE_KEYS.taskLogs, JSON.stringify(initialTaskLogs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.taskFiles)) {
    localStorage.setItem(STORAGE_KEYS.taskFiles, JSON.stringify(initialTaskFiles));
  }
  if (!localStorage.getItem(STORAGE_KEYS.projects)) {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  }
};

// Initialize on module load
initializeStorage();

// Generic fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  if (USE_MOCK_API) {
    // Mock API implementation
    await delay(100); // Simulate network delay
    return mockHandler(endpoint, options);
  }

  // Real API implementation
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Mock API handler (simulates backend behavior)
const mockHandler = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;

  // Tasks endpoints
  if (endpoint.startsWith('/tasks')) {
    if (method === 'GET') {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || '[]');
      if (endpoint.match(/\/tasks\/[^/]+$/)) {
        const id = endpoint.split('/').pop();
        return tasks.find(t => t.id === id);
      }
      return tasks;
    }
    if (method === 'POST') {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || '[]');
      const newTask = { ...body, id: `task-${Date.now()}`, created_at: new Date().toISOString() };
      tasks.push(newTask);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
      return newTask;
    }
    if (method === 'PUT') {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || '[]');
      const id = endpoint.split('/').pop();
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...body, updated_at: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
        return tasks[index];
      }
      throw new Error('Task not found');
    }
    if (method === 'DELETE') {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || '[]');
      const id = endpoint.split('/').pop();
      const filtered = tasks.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(filtered));
      return { success: true };
    }
  }

  // Projects endpoints
  if (endpoint.startsWith('/projects')) {
    if (method === 'GET') {
      const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.projects) || '[]');
      if (endpoint.match(/\/projects\/[^/]+$/)) {
        const id = endpoint.split('/').pop();
        return projects.find(p => p.id === id);
      }
      return projects;
    }
    if (method === 'POST') {
      const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.projects) || '[]');
      const newProject = { ...body, id: `proj-${Date.now()}`, created_at: new Date().toISOString() };
      projects.push(newProject);
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
      return newProject;
    }
    if (method === 'PUT') {
      const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.projects) || '[]');
      const id = endpoint.split('/').pop();
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...body };
        localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
        return projects[index];
      }
      throw new Error('Project not found');
    }
    if (method === 'DELETE') {
      const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.projects) || '[]');
      const id = endpoint.split('/').pop();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(filtered));
      return { success: true };
    }
  }

  // Comments endpoints
  if (endpoint.startsWith('/comments')) {
    if (method === 'GET') {
      const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.comments) || '{}');
      return comments;
    }
    if (method === 'POST') {
      const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.comments) || '{}');
      const taskId = body.taskId;
      const newComment = { id: `comment-${Date.now()}`, ...body };
      comments[taskId] = [...(comments[taskId] || []), newComment];
      localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(comments));
      return newComment;
    }
  }

  // Activity logs endpoints
  if (endpoint.startsWith('/logs')) {
    if (method === 'GET') {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.taskLogs) || '{}');
      return logs;
    }
    if (method === 'POST') {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.taskLogs) || '{}');
      const taskId = body.taskId;
      const newLog = { id: `log-${Date.now()}`, ...body };
      logs[taskId] = [newLog, ...(logs[taskId] || [])];
      localStorage.setItem(STORAGE_KEYS.taskLogs, JSON.stringify(logs));
      return newLog;
    }
  }

  // Files endpoints
  if (endpoint.startsWith('/files')) {
    if (method === 'GET') {
      const files = JSON.parse(localStorage.getItem(STORAGE_KEYS.taskFiles) || '{}');
      return files;
    }
    if (method === 'POST') {
      const files = JSON.parse(localStorage.getItem(STORAGE_KEYS.taskFiles) || '{}');
      const taskId = body.taskId;
      const newFile = { id: `file-${Date.now()}`, ...body };
      files[taskId] = [...(files[taskId] || []), newFile];
      localStorage.setItem(STORAGE_KEYS.taskFiles, JSON.stringify(files));
      return newFile;
    }
  }

  // Static data endpoints
  if (endpoint === '/users') return users;
  if (endpoint === '/divisions') return divisions;
  if (endpoint === '/statuses') return statuses;
  if (endpoint === '/priorities') return priorities;

  throw new Error(`Unknown endpoint: ${endpoint}`);
};

// API Service object with all data operations
export const apiService = {
  // Tasks
  getTasks: () => apiFetch('/tasks'),
  getTask: (id) => apiFetch(`/tasks/${id}`),
  createTask: (taskData) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  updateTask: (id, updates) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteTask: (id) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: () => apiFetch('/projects'),
  getProject: (id) => apiFetch(`/projects/${id}`),
  createProject: (projectData) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(projectData) }),
  updateProject: (id, updates) => apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteProject: (id) => apiFetch(`/projects/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: () => apiFetch('/comments'),
  addComment: (taskId, content, userId) => apiFetch('/comments', { 
    method: 'POST', 
    body: JSON.stringify({ taskId, content, user_id: userId, created_at: new Date().toISOString(), replies: [] }) 
  }),

  // Activity Logs
  getLogs: () => apiFetch('/logs'),
  addLog: (taskId, action, notes, userId) => apiFetch('/logs', { 
    method: 'POST', 
    body: JSON.stringify({ taskId, action, notes, user_id: userId, timestamp: new Date().toISOString() }) 
  }),

  // Files
  getFiles: () => apiFetch('/files'),
  addFile: (taskId, fileData) => apiFetch('/files', { 
    method: 'POST', 
    body: JSON.stringify({ taskId, ...fileData, uploaded_at: new Date().toISOString() }) 
  }),

  // Static data (for caching/reference)
  getUsers: () => Promise.resolve(users),
  getDivisions: () => Promise.resolve(divisions),
  getStatuses: () => Promise.resolve(statuses),
  getPriorities: () => Promise.resolve(priorities),

  // Status operations
  updateTaskStatus: async (taskId, newStatus, currentUserId) => {
    await apiService.updateTask(taskId, { status: newStatus });
    await apiService.addLog(taskId, 'status', `Status changed to ${newStatus}`, currentUserId);
  },

  // Reset to initial data (for testing)
  resetToInitialData: () => {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(initialTasks));
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(initialComments));
    localStorage.setItem(STORAGE_KEYS.taskLogs, JSON.stringify(initialTaskLogs));
    localStorage.setItem(STORAGE_KEYS.taskFiles, JSON.stringify(initialTaskFiles));
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  },
};

// Utility to check API health
export const checkApiHealth = async () => {
  try {
    if (USE_MOCK_API) {
      return { status: 'ok', mode: 'mock' };
    }
    const response = await fetch(`${API_BASE_URL}/health`);
    return { status: 'ok', mode: 'live' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

export default apiService;