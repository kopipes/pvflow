/**
 * Initial Database Schema for PVFlow
 * 
 * This migration creates all the tables needed for the project management system.
 * Tables: divisions, users, projects, tasks, comments, task_logs, task_files
 */

exports.up = function(knex) {
  return knex.schema
    // Divisions table
    .createTable('divisions', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('color').defaultTo('#6366f1');
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Users table
    .createTable('users', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('role').notNullable().defaultTo('user'); // admin, corporate, manager, spv, user
      table.string('division_id').references('id').inTable('divisions').onDelete('SET NULL');
      table.string('color').defaultTo('#6366f1');
      table.string('initials', 2).defaultTo('');
      table.string('password_hash').defaultTo(''); // For future auth implementation
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Projects table
    .createTable('projects', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('client').defaultTo('');
      table.string('division_id').references('id').inTable('divisions').onDelete('SET NULL');
      table.string('color').defaultTo('#6366f1');
      table.string('status').defaultTo('active'); // active, completed, archived
      table.text('description');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Tasks table
    .createTable('tasks', function(table) {
      table.string('id').primary();
      table.string('title').notNullable();
      table.text('brief'); // Description
      table.string('status').defaultTo('request'); // request, brief, progress, review, client, revision, approved, delivered
      table.string('priority').defaultTo('medium'); // low, medium, high, urgent
      table.string('project_id').references('id').inTable('projects').onDelete('SET NULL');
      table.string('division_id').references('id').inTable('divisions').onDelete('SET NULL');
      table.string('assignee_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('created_by').references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('due_date');
      table.timestamp('revision_deadline');
      table.timestamp('approval_deadline');
      table.string('tags').defaultTo(''); // JSON string array
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Comments table (JSON for simplicity - can be normalized later)
    .createTable('comments', function(table) {
      table.increments('id').primary();
      table.string('task_id').references('id').inTable('tasks').onDelete('CASCADE');
      table.string('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.text('content').notNullable();
      table.string('parent_id').references('id').inTable('comments').onDelete('CASCADE'); // For replies
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    
    // Task logs (activity history)
    .createTable('task_logs', function(table) {
      table.increments('id').primary();
      table.string('task_id').references('id').inTable('tasks').onDelete('CASCADE');
      table.string('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('action').notNullable(); // created, status, comment, file, approved, rejected
      table.text('notes');
      table.timestamp('timestamp').defaultTo(knex.fn.now());
    })
    
    // Task files
    .createTable('task_files', function(table) {
      table.increments('id').primary();
      table.string('task_id').references('id').inTable('tasks').onDelete('CASCADE');
      table.string('filename').notNullable();
      table.string('type').defaultTo(''); // pdf, psd, ai, etc
      table.bigInteger('size').defaultTo(0); // File size in bytes
      table.integer('version').defaultTo(1);
      table.text('notes');
      table.string('uploaded_by').references('id').inTable('users').onDelete('SET NULL');
      table.string('url').defaultTo('#'); // File URL/path
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('task_files')
    .dropTableIfExists('task_logs')
    .dropTableIfExists('comments')
    .dropTableIfExists('tasks')
    .dropTableIfExists('projects')
    .dropTableIfExists('users')
    .dropTableIfExists('divisions');
};