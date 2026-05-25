// Authentication Store for PVFlow
// Handles user login/logout and session management

import { create } from 'zustand';
import { users } from '../data/mockData';

const AUTH_STORAGE_KEY = 'pvflow_auth';

// Load saved session
const loadSavedSession = () => {
  try {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      // Check if session is expired (24 hours)
      if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
        return parsed;
      }
      // Clear expired session
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to load auth session:', e);
  }
  return null;
};

export const useAuthStore = create((set, get) => ({
  // Current user (null if not logged in)
  currentUser: null,
  
  // Auth state
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Session info
  sessionStart: null,
  lastActivity: null,
  
  // Initialize - check for existing session
  initialize: () => {
    const savedSession = loadSavedSession();
    if (savedSession) {
      const user = users.find(u => u.id === savedSession.userId);
      if (user) {
        set({
          currentUser: user,
          isAuthenticated: true,
          sessionStart: savedSession.sessionStart,
          lastActivity: Date.now(),
        });
        return true;
      }
    }
    return false;
  },
  
  // Login with email and password
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      const { isLoading } = get();
      if (isLoading) return reject(new Error('Already logging in'));
      
      set({ isLoading: true, error: null });
      
      // Simulate API delay
      setTimeout(() => {
        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          set({ isLoading: false, error: 'User not found' });
          reject(new Error('User not found'));
          return;
        }
        
        // In a real app, we'd verify the password here
        // For demo, any password works
        if (!password || password.length < 1) {
          set({ isLoading: false, error: 'Password is required' });
          reject(new Error('Password is required'));
          return;
        }
        
        // Create session
        const sessionData = {
          userId: user.id,
          sessionStart: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        };
        
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        
        set({
          currentUser: user,
          isAuthenticated: true,
          isLoading: false,
          sessionStart: sessionData.sessionStart,
          lastActivity: Date.now(),
          error: null,
        });
        
        resolve(user);
      }, 500);
    });
  },
  
  // Login as demo user (no password)
  loginAsDemo: (userId) => {
    return new Promise((resolve, reject) => {
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        reject(new Error('User not found'));
        return;
      }
      
      const sessionData = {
        userId: user.id,
        sessionStart: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      
      set({
        currentUser: user,
        isAuthenticated: true,
        isLoading: false,
        sessionStart: sessionData.sessionStart,
        lastActivity: Date.now(),
        error: null,
      });
      
      resolve(user);
    });
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      sessionStart: null,
      lastActivity: null,
      error: null,
    });
  },
  
  // Update last activity timestamp
  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
  
  // Check if session is valid
  isSessionValid: () => {
    const { isAuthenticated, lastActivity } = get();
    if (!isAuthenticated) return false;
    
    // Session expires after 24 hours of inactivity
    const inactivityTimeout = 24 * 60 * 60 * 1000;
    if (lastActivity && Date.now() - lastActivity > inactivityTimeout) {
      get().logout();
      return false;
    }
    
    return true;
  },
  
  // Get available users for demo login
  getAvailableUsers: () => {
    return users;
  },
}));

export default useAuthStore;