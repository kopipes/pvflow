# PVFlow Database Guide

## Current Setup
- **Database**: SQLite (better-sqlite3)
- **Location**: `server/data/pvflow.db`
- **Migrations**: `server/migrations/`
- **Seeds**: `server/seeds/`

## Database Commands

```bash
# Run all migrations
npm run db:migrate
# or: cd server && npx knex migrate:latest --knexfile knexfile.cjs

# Seed the database with sample data
npm run db:seed
# or: cd server && npx knex seed:run --knexfile knexfile.cjs

# Run both migrations and seeds
npm run db:setup

# Check migration status
npm run db:status

# Rollback last migration
npm run db:rollback
```

## Switching to Another Database

The project uses **Knex.js** for database abstraction, making it easy to switch between different databases.

### To PostgreSQL

1. Install PostgreSQL driver:
```bash
npm install pg
```

2. Update `server/knexfile.cjs`:
```javascript
production: {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pvflow',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
}
```

3. Set environment variables or update the config directly

### To MySQL/MariaDB

1. Install MySQL driver:
```bash
npm install mysql2
```

2. Update `server/knexfile.cjs`:
```javascript
production: {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'pvflow',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
}
```

### To Supabase (PostgreSQL)

1. Install:
```bash
npm install pg
```

2. Update connection:
```javascript
production: {
  client: 'pg',
  connection: {
    host: process.env.SUPABASE_HOST,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_PASSWORD,
    ssl: { rejectUnauthorized: false }
  }
}
```

### To PlanetScale (MySQL)

1. Install:
```bash
npm install mysql2
```

2. Update connection:
```javascript
production: {
  client: 'mysql2',
  connection: {
    host: process.env.PLANETSCALE_HOST,
    port: 3306,
    database: process.env.PLANETSCALE_DATABASE,
    user: process.env.PLANETSCALE_USERNAME,
    password: process.env.PLANETSCALE_PASSWORD,
    ssl: { rejectUnauthorized: true }
  }
}
```

## Database Schema

Tables created:
- `divisions` - Project divisions/teams
- `users` - User accounts
- `projects` - Client projects
- `tasks` - Work tasks
- `comments` - Task comments
- `task_logs` - Activity history
- `task_files` - File attachments

## Notes

- All `.cjs` files use CommonJS (required for Knex with ES module projects)
- Run migrations before starting the server when changing databases
- Seed data provides sample users, projects, and tasks for development