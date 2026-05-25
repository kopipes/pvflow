// Initial mock data for PVFlow

export const divisions = [
  { id: 'div-1', name: 'Creative' },
  { id: 'div-2', name: 'Marketing' },
  { id: 'div-3', name: 'Digital' },
];

export const users = [
  { id: 'user-1', name: 'Sarah Chen', role: 'admin', email: 'sarah@pvflow.com', division_id: 'div-1', initials: 'SC', color: '#6366f1' },
  { id: 'user-2', name: 'Michael Park', role: 'corporate', email: 'michael@pvflow.com', division_id: 'div-1', initials: 'MP', color: '#22c55e' },
  { id: 'user-3', name: 'Emily Johnson', role: 'manager', email: 'emily@pvflow.com', division_id: 'div-1', initials: 'EJ', color: '#f59e0b' },
  { id: 'user-4', name: 'David Kim', role: 'spv', email: 'david@pvflow.com', division_id: 'div-1', initials: 'DK', color: '#ef4444' },
  { id: 'user-5', name: 'Lisa Wang', role: 'user', email: 'lisa@pvflow.com', division_id: 'div-1', initials: 'LW', color: '#8b5cf6' },
  { id: 'user-6', name: 'James Brown', role: 'user', email: 'james@pvflow.com', division_id: 'div-2', initials: 'JB', color: '#06b6d4' },
  { id: 'user-7', name: 'Amy Taylor', role: 'manager', email: 'amy@pvflow.com', division_id: 'div-2', initials: 'AT', color: '#ec4899' },
];

export const statuses = [
  { id: 'request', label: 'Request', color: '#94a3b8' },
  { id: 'brief', label: 'Brief', color: '#6366f1' },
  { id: 'progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'review', label: 'Internal Review', color: '#8b5cf6' },
  { id: 'client', label: 'Client Review', color: '#f97316' },
  { id: 'revision', label: 'Revision', color: '#ef4444' },
  { id: 'approved', label: 'Approved', color: '#22c55e' },
  { id: 'delivered', label: 'Delivered', color: '#10b981' },
];

export const priorities = [
  { id: 'low', label: 'Low', color: '#64748b' },
  { id: 'medium', label: 'Medium', color: '#6366f1' },
  { id: 'high', label: 'High', color: '#f59e0b' },
  { id: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export const projects = [
  { id: 'proj-1', name: 'Brand Refresh 2026', client: 'Acme Corp', division_id: 'div-1', color: '#6366f1', status: 'active' },
  { id: 'proj-2', name: 'Website Redesign', client: 'TechStart Inc', division_id: 'div-1', color: '#22c55e', status: 'active' },
  { id: 'proj-3', name: 'Social Media Campaign', client: 'Fashion House', division_id: 'div-2', color: '#f59e0b', status: 'active' },
  { id: 'proj-4', name: 'Product Launch Video', client: 'Gadget Co', division_id: 'div-3', color: '#8b5cf6', status: 'active' },
];

export const initialTasks = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    title: 'Design new logo concepts',
    brief: 'Create 3 different logo concepts for the brand refresh. Each concept should have distinct visual identity while maintaining brand recognition.',
    status: 'progress',
    priority: 'high',
    assignee_id: 'user-4',
    created_by: 'user-1',
    division_id: 'div-1',
    due_date: '2026-05-28T17:00:00',
    revision_deadline: '2026-05-26T17:00:00',
    approval_deadline: '2026-05-27T17:00:00',
    tags: ['logo', 'branding', 'design'],
    created_at: '2026-05-20T09:00:00',
    updated_at: '2026-05-24T14:30:00',
  },
  {
    id: 'task-2',
    project_id: 'proj-1',
    title: 'Typography guidelines document',
    brief: 'Develop comprehensive typography guidelines including font families, sizes, weights, and usage rules for all brand materials.',
    status: 'brief',
    priority: 'medium',
    assignee_id: 'user-5',
    created_by: 'user-1',
    division_id: 'div-1',
    due_date: '2026-06-01T17:00:00',
    revision_deadline: null,
    approval_deadline: null,
    tags: ['typography', 'guidelines'],
    created_at: '2026-05-21T10:00:00',
    updated_at: '2026-05-21T10:00:00',
  },
  {
    id: 'task-3',
    project_id: 'proj-2',
    title: 'Homepage wireframe design',
    brief: 'Design wireframes for the new homepage focusing on improved UX and conversion optimization. Include mobile responsive layouts.',
    status: 'revision',
    priority: 'urgent',
    assignee_id: 'user-3',
    created_by: 'user-2',
    division_id: 'div-1',
    due_date: '2026-05-25T17:00:00',
    revision_deadline: '2026-05-24T17:00:00',
    approval_deadline: '2026-05-24T12:00:00',
    tags: ['wireframe', 'ux', 'homepage'],
    created_at: '2026-05-18T11:00:00',
    updated_at: '2026-05-23T16:00:00',
  },
  {
    id: 'task-4',
    project_id: 'proj-3',
    title: 'Instagram content calendar',
    brief: 'Plan and create content calendar for Instagram for the month of June. Include holiday themes and product showcases.',
    status: 'approved',
    priority: 'medium',
    assignee_id: 'user-6',
    created_by: 'user-7',
    division_id: 'div-2',
    due_date: '2026-05-30T17:00:00',
    revision_deadline: null,
    approval_deadline: null,
    tags: ['social', 'instagram', 'content'],
    created_at: '2026-05-15T09:00:00',
    updated_at: '2026-05-22T11:00:00',
  },
  {
    id: 'task-5',
    project_id: 'proj-4',
    title: 'Video storyboard creation',
    brief: 'Create detailed storyboard for product launch video. Include all scenes, camera angles, and keyframes.',
    status: 'client',
    priority: 'high',
    assignee_id: 'user-4',
    created_by: 'user-1',
    division_id: 'div-3',
    due_date: '2026-05-27T17:00:00',
    revision_deadline: null,
    approval_deadline: '2026-05-26T17:00:00',
    tags: ['video', 'storyboard', 'production'],
    created_at: '2026-05-19T14:00:00',
    updated_at: '2026-05-24T09:00:00',
  },
];

export const initialComments = {
  'task-1': [
    {
      id: 'comment-1',
      user_id: 'user-3',
      content: 'Looking great! Can we explore a more minimalist approach for concept 2?',
      created_at: '2026-05-23T10:30:00',
      replies: [
        { id: 'reply-1', user_id: 'user-4', content: 'Sure, I will revise concept 2 with a cleaner look.', created_at: '2026-05-23T11:00:00' }
      ]
    },
    {
      id: 'comment-2',
      user_id: 'user-1',
      content: 'Client loved concept 1! Let\'s move forward with that direction.',
      created_at: '2026-05-24T14:00:00',
      replies: []
    }
  ],
  'task-3': [
    {
      id: 'comment-3',
      user_id: 'user-2',
      content: 'Need to revise the hero section. Client wants a bigger call-to-action.',
      created_at: '2026-05-23T16:00:00',
      replies: []
    }
  ]
};

export const initialTaskLogs = {
  'task-1': [
    { id: 'log-1', user_id: 'user-1', action: 'created', timestamp: '2026-05-20T09:00:00', notes: 'Task created' },
    { id: 'log-2', user_id: 'user-3', action: 'comment', timestamp: '2026-05-23T10:30:00', notes: 'Left feedback on concepts' },
    { id: 'log-3', user_id: 'user-1', action: 'approved', timestamp: '2026-05-24T14:30:00', notes: 'Concept 1 approved by client' },
  ],
  'task-3': [
    { id: 'log-4', user_id: 'user-2', action: 'created', timestamp: '2026-05-18T11:00:00', notes: 'Task created' },
    { id: 'log-5', user_id: 'user-3', action: 'status', timestamp: '2026-05-22T09:00:00', notes: 'Moved to Revision' },
  ]
};

export const initialTaskFiles = {
  'task-1': [
    {
      id: 'file-1',
      filename: 'logo_concept_1_v2.psd',
      type: 'psd',
      size: 45200000,
      version: 2,
      notes: 'Revised colors based on feedback',
      uploaded_by: 'user-4',
      uploaded_at: '2026-05-23T14:00:00',
      url: '#'
    },
    {
      id: 'file-2',
      filename: 'logo_concept_1.ai',
      type: 'ai',
      size: 8900000,
      version: 1,
      notes: 'Original vector file',
      uploaded_by: 'user-4',
      uploaded_at: '2026-05-20T10:00:00',
      url: '#'
    }
  ],
  'task-3': [
    {
      id: 'file-3',
      filename: 'homepage_wireframe_v3.pdf',
      type: 'pdf',
      size: 3200000,
      version: 3,
      notes: 'Updated hero section',
      uploaded_by: 'user-3',
      uploaded_at: '2026-05-23T16:00:00',
      url: '#'
    }
  ]
};