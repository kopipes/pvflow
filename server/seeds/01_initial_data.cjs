/**
 * Initial Seed Data for PVFlow
 * Populates the database with sample divisions, users, projects, and tasks
 */

exports.seed = async function(knex) {
  // Clear existing data in reverse order of dependencies
  await knex('task_files').del();
  await knex('task_logs').del();
  await knex('comments').del();
  await knex('tasks').del();
  await knex('projects').del();
  await knex('users').del();
  await knex('divisions').del();

  // Insert divisions
  await knex('divisions').insert([
    { id: 'div-1', name: 'Creative', color: '#6366f1', status: 'active' },
    { id: 'div-2', name: 'Marketing', color: '#22c55e', status: 'active' },
    { id: 'div-3', name: 'Digital', color: '#f59e0b', status: 'active' },
  ]);

  // Insert users
  await knex('users').insert([
    { id: 'user-1', name: 'Sarah Chen', role: 'admin', email: 'sarah@pvflow.com', division_id: 'div-1', initials: 'SC', color: '#6366f1', status: 'active' },
    { id: 'user-2', name: 'Michael Park', role: 'corporate', email: 'michael@pvflow.com', division_id: 'div-1', initials: 'MP', color: '#22c55e', status: 'active' },
    { id: 'user-3', name: 'Emily Johnson', role: 'manager', email: 'emily@pvflow.com', division_id: 'div-1', initials: 'EJ', color: '#f59e0b', status: 'active' },
    { id: 'user-4', name: 'David Kim', role: 'spv', email: 'david@pvflow.com', division_id: 'div-1', initials: 'DK', color: '#ef4444', status: 'active' },
    { id: 'user-5', name: 'Lisa Wang', role: 'user', email: 'lisa@pvflow.com', division_id: 'div-1', initials: 'LW', color: '#8b5cf6', status: 'active' },
    { id: 'user-6', name: 'James Brown', role: 'user', email: 'james@pvflow.com', division_id: 'div-2', initials: 'JB', color: '#06b6d4', status: 'active' },
    { id: 'user-7', name: 'Amy Taylor', role: 'manager', email: 'amy@pvflow.com', division_id: 'div-2', initials: 'AT', color: '#ec4899', status: 'active' },
  ]);

  // Insert projects
  await knex('projects').insert([
    { id: 'proj-1', name: 'Brand Refresh 2026', client: 'Acme Corp', division_id: 'div-1', color: '#6366f1', status: 'active' },
    { id: 'proj-2', name: 'Website Redesign', client: 'TechStart Inc', division_id: 'div-1', color: '#22c55e', status: 'active' },
    { id: 'proj-3', name: 'Social Media Campaign', client: 'Fashion House', division_id: 'div-2', color: '#f59e0b', status: 'active' },
    { id: 'proj-4', name: 'Product Launch Video', client: 'Gadget Co', division_id: 'div-3', color: '#8b5cf6', status: 'active' },
  ]);

  // Insert tasks
  await knex('tasks').insert([
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
      tags: JSON.stringify(['logo', 'branding', 'design']),
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
      tags: JSON.stringify(['typography', 'guidelines']),
      created_at: '2026-05-21T10:00:00',
      updated_at: '2026-05-21T10:00:00',
    },
    {
      id: 'task-3',
      project_id: 'proj-2',
      title: 'Homepage wireframe design',
      brief: 'Design wireframes for the new homepage focusing on improved UX and conversion optimization.',
      status: 'revision',
      priority: 'urgent',
      assignee_id: 'user-3',
      created_by: 'user-2',
      division_id: 'div-1',
      due_date: '2026-05-25T17:00:00',
      revision_deadline: '2026-05-24T17:00:00',
      approval_deadline: '2026-05-24T12:00:00',
      tags: JSON.stringify(['wireframe', 'ux', 'homepage']),
      created_at: '2026-05-18T11:00:00',
      updated_at: '2026-05-23T16:00:00',
    },
    {
      id: 'task-4',
      project_id: 'proj-3',
      title: 'Instagram content calendar',
      brief: 'Plan and create content calendar for Instagram for the month of June.',
      status: 'approved',
      priority: 'medium',
      assignee_id: 'user-6',
      created_by: 'user-7',
      division_id: 'div-2',
      due_date: '2026-05-30T17:00:00',
      tags: JSON.stringify(['social', 'instagram', 'content']),
      created_at: '2026-05-15T09:00:00',
      updated_at: '2026-05-22T11:00:00',
    },
    {
      id: 'task-5',
      project_id: 'proj-4',
      title: 'Video storyboard creation',
      brief: 'Create detailed storyboard for product launch video.',
      status: 'client',
      priority: 'high',
      assignee_id: 'user-4',
      created_by: 'user-1',
      division_id: 'div-3',
      due_date: '2026-05-27T17:00:00',
      approval_deadline: '2026-05-26T17:00:00',
      tags: JSON.stringify(['video', 'storyboard', 'production']),
      created_at: '2026-05-19T14:00:00',
      updated_at: '2026-05-24T09:00:00',
    },
  ]);

  // Insert sample comments
  await knex('comments').insert([
    {
      task_id: 'task-1',
      user_id: 'user-3',
      content: 'Looking great! Can we explore a more minimalist approach for concept 2?',
      created_at: '2026-05-23T10:30:00',
    },
    {
      task_id: 'task-1',
      user_id: 'user-1',
      content: 'Client loved concept 1! Let\'s move forward with that direction.',
      created_at: '2026-05-24T14:00:00',
    },
    {
      task_id: 'task-3',
      user_id: 'user-2',
      content: 'Need to revise the hero section. Client wants a bigger call-to-action.',
      created_at: '2026-05-23T16:00:00',
    },
  ]);

  // Insert sample task logs
  await knex('task_logs').insert([
    { task_id: 'task-1', user_id: 'user-1', action: 'created', notes: 'Task created', timestamp: '2026-05-20T09:00:00' },
    { task_id: 'task-1', user_id: 'user-3', action: 'comment', notes: 'Left feedback on concepts', timestamp: '2026-05-23T10:30:00' },
    { task_id: 'task-1', user_id: 'user-1', action: 'approved', notes: 'Concept 1 approved by client', timestamp: '2026-05-24T14:30:00' },
    { task_id: 'task-3', user_id: 'user-2', action: 'created', notes: 'Task created', timestamp: '2026-05-18T11:00:00' },
    { task_id: 'task-3', user_id: 'user-3', action: 'status', notes: 'Moved to Revision', timestamp: '2026-05-22T09:00:00' },
  ]);
};