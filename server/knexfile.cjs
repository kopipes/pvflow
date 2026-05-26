// Knex.js Database Configuration
// This file configures database connections for different environments.
// Currently using SQLite - easily switchable to PostgreSQL, MySQL, etc.

module.exports = {
  // Development environment (SQLite by default)
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './data/pvflow.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  // Production environment
  // To switch to PostgreSQL, change client to 'pg' and update connection
  production: {
    client: process.env.DB_CLIENT || 'better-sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || './data/pvflow.db',
      // For PostgreSQL:
      // host: process.env.DB_HOST || 'localhost',
      // port: process.env.DB_PORT || 5432,
      // database: process.env.DB_NAME || 'pvflow',
      // user: process.env.DB_USER || 'postgres',
      // password: process.env.DB_PASSWORD || '',
    },
    useNullAsDefault: true,
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
  },

  // Test environment
  test: {
    client: 'better-sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  }
};