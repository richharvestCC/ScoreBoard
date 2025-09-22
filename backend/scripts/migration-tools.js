#!/usr/bin/env node

/**
 * Enhanced Migration Tools CLI
 * Provides advanced migration management with logging and error handling
 */

const { log } = require('../src/config/logger');
const db = require('../src/models');

class MigrationToolsCLI {
  constructor() {
    this.commands = {
      'status': this.showStatus.bind(this),
      'health': this.checkHealth.bind(this),
      'up': this.runMigrations.bind(this),
      'down': this.rollbackMigration.bind(this),
      'reset': this.resetDatabase.bind(this),
      'help': this.showHelp.bind(this)
    };
  }

  async run() {
    const command = process.argv[2] || 'help';

    if (!this.commands[command]) {
      console.error(`❌ Unknown command: ${command}`);
      this.showHelp();
      process.exit(1);
    }

    try {
      await db.testConnection();
      await this.commands[command]();
    } catch (error) {
      log.error('Migration tool execution failed', {
        command,
        error: error.message,
        stack: error.stack
      });
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    } finally {
      await db.sequelize.close();
    }
  }

  async showStatus() {
    console.log('📊 Migration Status Check\n');

    const status = await db.checkMigrationsStatus();

    console.log(`Total migrations: ${status.totalMigrations}`);
    console.log(`Executed migrations: ${status.executedMigrations}`);
    console.log(`Pending migrations: ${status.pendingMigrations}`);

    if (status.pendingMigrations > 0) {
      console.log('\n⚠️  Pending migrations detected!');
      console.log('Run `npm run migrate` or `node scripts/migration-tools.js up` to apply them.');
    } else if (status.totalMigrations === 0) {
      console.log('\n📝 No migrations found.');
      console.log('Create your first migration with `npm run migrate:create -- --name your_migration_name`');
    } else {
      console.log('\n✅ All migrations are up to date!');
    }

    if (status.error) {
      console.log(`\n❌ Error: ${status.error}`);
    }
  }

  async checkHealth() {
    console.log('🏥 Migration Health Check\n');

    const health = await db.checkMigrationHealth();

    console.log(`Status: ${health.status}`);
    console.log(`Migrations directory: ${health.migrationsDirectory}`);

    if (health.status === 'healthy') {
      console.log('✅ Migration system is healthy!');
    } else if (health.status === 'pending-migrations') {
      console.log(`⚠️  ${health.warning}`);
    } else if (health.status === 'error') {
      console.log(`❌ ${health.error}`);
    }

    console.log('\nDetails:');
    console.log(`- Total migrations: ${health.totalMigrations || 0}`);
    console.log(`- Executed: ${health.executedMigrations || 0}`);
    console.log(`- Pending: ${health.pendingMigrations || 0}`);
  }

  async runMigrations() {
    console.log('⬆️  Running Migrations\n');

    const migrations = await db.runMigrations();

    if (migrations.length === 0) {
      console.log('✅ No pending migrations to run.');
    } else {
      console.log(`✅ Successfully applied ${migrations.length} migrations:`);
      migrations.forEach(migration => {
        console.log(`  - ${migration.name}`);
      });
    }
  }

  async rollbackMigration() {
    console.log('⬇️  Rolling Back Last Migration\n');

    try {
      const { Umzug, SequelizeStorage } = require('umzug');
      const path = require('path');

      const umzug = new Umzug({
        migrations: {
          glob: path.resolve(__dirname, '../migrations/*.js'),
          resolve: ({ name, path: migrationPath }) => {
            const migration = require(migrationPath);
            return {
              name,
              up: async () => migration.up(db.sequelize.getQueryInterface(), db.sequelize.constructor),
              down: async () => migration.down(db.sequelize.getQueryInterface(), db.sequelize.constructor),
            };
          },
        },
        context: db.sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize: db.sequelize }),
        logger: {
          info: (message) => log.debug(message, { component: 'umzug-rollback' }),
          warn: (message) => log.warn(message, { component: 'umzug-rollback' }),
          error: (message) => log.error(message, { component: 'umzug-rollback' })
        },
      });

      const executed = await umzug.executed();

      if (executed.length === 0) {
        console.log('❌ No migrations to rollback.');
        return;
      }

      const lastMigration = executed[executed.length - 1];
      console.log(`Rolling back: ${lastMigration.name}`);

      await umzug.down({ to: lastMigration.name });

      console.log(`✅ Successfully rolled back migration: ${lastMigration.name}`);

      log.info('Migration rollback completed', {
        migration: lastMigration.name,
        action: 'rollback'
      });

    } catch (error) {
      log.error('Migration rollback failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async resetDatabase() {
    console.log('🔄 Resetting Database\n');
    console.log('⚠️  This will rollback ALL migrations and re-apply them!');

    // In a real CLI, you'd want to add confirmation prompt here
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database reset is not allowed in production environment');
    }

    try {
      const { Umzug, SequelizeStorage } = require('umzug');
      const path = require('path');

      const umzug = new Umzug({
        migrations: {
          glob: path.resolve(__dirname, '../migrations/*.js'),
          resolve: ({ name, path: migrationPath }) => {
            const migration = require(migrationPath);
            return {
              name,
              up: async () => migration.up(db.sequelize.getQueryInterface(), db.sequelize.constructor),
              down: async () => migration.down(db.sequelize.getQueryInterface(), db.sequelize.constructor),
            };
          },
        },
        context: db.sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize: db.sequelize }),
        logger: null,
      });

      // Rollback all migrations
      console.log('⬇️  Rolling back all migrations...');
      await umzug.down({ to: 0 });

      // Re-apply all migrations
      console.log('⬆️  Re-applying all migrations...');
      const migrations = await umzug.up();

      console.log(`✅ Database reset completed! Applied ${migrations.length} migrations.`);

      log.info('Database reset completed', {
        migrationsApplied: migrations.length,
        action: 'reset'
      });

    } catch (error) {
      log.error('Database reset failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  showHelp() {
    console.log(`
🛠️  Migration Tools CLI

Usage: node scripts/migration-tools.js <command>

Commands:
  status    Show migration status (pending, executed, total)
  health    Comprehensive health check of migration system
  up        Run all pending migrations
  down      Rollback the last migration
  reset     Reset database (rollback all + re-apply all) [DEV ONLY]
  help      Show this help message

Examples:
  node scripts/migration-tools.js status
  node scripts/migration-tools.js up
  node scripts/migration-tools.js health

NPM Scripts:
  npm run migrate           - Run pending migrations
  npm run migrate:status    - Show migration status
  npm run migrate:undo      - Rollback last migration
  npm run migrate:create    - Create new migration file
    `);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new MigrationToolsCLI();
  cli.run().catch(console.error);
}

module.exports = MigrationToolsCLI;