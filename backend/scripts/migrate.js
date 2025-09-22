#!/usr/bin/env node

/**
 * Migration Management CLI Tool
 * Provides easy migration management commands
 */

const { exec } = require('child_process');
const path = require('path');

const commands = {
  up: {
    description: 'Run all pending migrations',
    command: 'npx sequelize-cli db:migrate'
  },
  down: {
    description: 'Undo the last migration',
    command: 'npx sequelize-cli db:migrate:undo'
  },
  reset: {
    description: 'Reset all migrations and re-run',
    command: 'npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate'
  },
  status: {
    description: 'Show migration status',
    command: 'npx sequelize-cli db:migrate:status'
  },
  create: {
    description: 'Create a new migration file',
    command: 'npx sequelize-cli migration:generate --name'
  }
};

async function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`⚠️ Warning: ${stderr}`);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function main() {
  const command = process.argv[2];
  const migrationName = process.argv[3];

  console.log('🔧 ScoreBoard Migration Tool\n');

  if (!command) {
    console.log('📋 Available commands:');
    Object.entries(commands).forEach(([cmd, info]) => {
      console.log(`   ${cmd.padEnd(8)} - ${info.description}`);
    });
    console.log('\n💡 Usage: node scripts/migrate.js <command> [migration-name]');
    console.log('   Example: node scripts/migrate.js create add-user-profile');
    return;
  }

  if (!commands[command]) {
    console.error(`❌ Unknown command: ${command}`);
    console.log('📋 Available commands:', Object.keys(commands).join(', '));
    return;
  }

  try {
    let fullCommand = commands[command].command;

    if (command === 'create') {
      if (!migrationName) {
        console.error('❌ Migration name required for create command');
        console.log('💡 Usage: node scripts/migrate.js create <migration-name>');
        return;
      }
      fullCommand += ` ${migrationName}`;
    }

    console.log(`🚀 Running: ${fullCommand}\n`);
    await runCommand(fullCommand);
    console.log('\n✅ Migration command completed successfully');

  } catch (error) {
    console.error('\n💥 Migration command failed');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();