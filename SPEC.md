# PVFlow - Project & Task Management System

## Overview

PVFlow is a comprehensive project management application designed for creative teams to manage projects, track tasks, handle approvals, and collaborate efficiently.

---

## Features

### 1. Multi-Role Access Control

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **Admin** | All access | Full system control, admin settings, user management, division master data, backup database |
| **Corporate** | All access minus admin settings | User management, division master data, backup database |
| **Manager** | Division access | View/manage all tasks in division, approve status changes |
| **Spv (Supervisor)** | Division access | View division tasks, update own projects, request approvals |
| **User** | Assigned projects only | View/edit assigned tasks, upload files, add comments |

### 2. Views

- **Dashboard** - Overview with metrics, my tasks, team workload, recent activity
- **Kanban Board** - Visual task board with drag-and-drop status management
- **Timeline** - Gantt-style view of tasks over time
- **Files** - File manager with version history
- **Team** - Team workload and availability view

### 3. Task Management

**Task Fields:**
- Title & Brief description
- Assignee (team member)
- Priority (Low, Medium, High, Urgent)
- Final Deadline
- Revision Deadline  
- Approval Deadline
- Tags for categorization
- Dependencies

**Status Pipeline (8 stages):**
```
Request → Brief → In Progress → Internal Review → Client Review → Revision → Approved → Delivered
```

### 4. Approval Workflow

**Statuses requiring approval:**
- Internal Review
- Client Review
- Approved

**Flow:**
1. Assignee completes work
2. Clicks next status (requires approval)
3. Task enters "Pending Approval" state
4. Manager/Corporate/Admin reviews
5. Approve → Status changes
6. Reject → Remains at current status with log

### 5. Collaboration

- **Comments** - Discussion threads on tasks
- **Files** - Upload and version control (PSD, AI, PDF, etc.)
- **Activity Log** - Full audit trail of all actions

### 6. Division Structure

**Divisions:**
- Design
- Marketing
- Development
- Creative

**Division-based filtering:**
- Manager/Spv see only their division's tasks
- User sees only assigned tasks
- Admin/Corporate see all tasks

---

## Technical Stack

- **Frontend**: React + Vite
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Styling**: CSS with CSS Variables

---

## File Structure

```
src/
├── api/
│   └── apiService.js        # API service layer (mock/real backend)
├── data/
│   └── mockData.js          # User roles, divisions, sample tasks
├── stores/
│   ├── taskStore.js         # Zustand store with permissions
│   └── authStore.js         # Authentication store
├── components/
│   ├── layout/
│   │   ├── Header.jsx       # Top navigation bar
│   │   └── Sidebar.jsx     # Navigation + user switcher
│   ├── views/
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── KanbanBoard.jsx # Kanban view
│   │   ├── TimelineView.jsx# Timeline/Gantt view
│   │   ├── CalendarView.jsx# Calendar view
│   │   ├── AdminSettings.jsx# Admin settings view
│   │   ├── FileManager.jsx # File management
│   │   └── TeamWorkload.jsx# Team overview
│   └── features/
│       ├── TaskDetailPanel.jsx # Task detail modal/panel
│       ├── NewTaskModal.jsx   # Create new task
│       ├── LoginModal.jsx     # Login/Authentication modal
│       └── AIFeedbackImport.jsx # AI import feature
├── App.jsx                  # Main app component
└── index.css               # Global styles
```

---

## Usage Flow

### Creating a Project
1. Click "New Task" in sidebar
2. Fill in task details (title, brief, assignee, deadline, etc.)
3. Task appears in "Request Received" status

### Managing Task Status
1. Drag task card to new column OR
2. Open task detail → Click status in pipeline
3. For approval-required statuses, request approval
4. Manager approves/rejects

### Role-Based Task Visibility
- Admin/Corporate: All tasks
- Manager: Division tasks only
- Spv: Division tasks only
- User: Assigned tasks only

### Testing Different Roles
- Click user avatar at bottom of sidebar
- Select different user to test permissions
- Observe menu changes and visible tasks

---

## API/Data Structure

### Users
```javascript
{
  id: 'u1',
  name: 'User Name',
  role: 'admin|corporate|manager|spv|user',
  division_id: 'div_design|div_marketing|div_dev|div_creative',
  email: 'user@example.com'
}
```

### Tasks
```javascript
{
  id: 't1',
  title: 'Task Title',
  brief: 'Description...',
  status: 'request|brief|progress|review|client|revision|approved|delivered',
  priority: 'low|medium|high|urgent',
  assignee_id: 'u1',
  created_by: 'u1',
  division_id: 'div_design',
  due_date: '2026-05-26T17:00:00Z',
  revision_deadline: '2026-05-25T12:00:00Z',
  approval_deadline: '2026-05-26T10:00:00Z',
  tags: ['campaign', 'urgent']
}
```

### Divisions
```javascript
{
  id: 'div_design',
  name: 'Design',
  color: '#4f7cff'
}
```

---

## Permission Summary

| Feature | Admin | Corporate | Manager | Spv | User |
|---------|-------|-----------|---------|-----|------|
| View all tasks | ✅ | ✅ | ❌ | ❌ | ❌ |
| View division tasks | ✅ | ✅ | ✅ | ✅ | ❌ |
| View assigned tasks | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own task | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit division task | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit any task | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve status | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete task | ✅ | ❌ | ✅* | ❌ | ❌ |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| Division Master | ✅ | ✅ | ❌ | ❌ | ❌ |
| Admin Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

*Manager can only delete tasks in their division

---

## Future Enhancements

- [x] Real backend API integration
- [x] User authentication (login/logout)
- [ ] Email notifications
- [x] Drag-drop file upload
- [ ] Real-time collaboration
- [x] Reports & analytics
- [x] Calendar integration
- [ ] Mobile app