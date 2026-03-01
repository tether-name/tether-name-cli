import { Command } from 'commander';
import chalk from 'chalk';
import { BANNER } from './utils/display.js';
import { initCommand } from './commands/init.js';
import { verifyCommand } from './commands/verify.js';
import { statusCommand } from './commands/status.js';
import { challengeCommand } from './commands/challenge.js';
import { signCommand } from './commands/sign.js';
import { checkCommand } from './commands/check.js';
import { agentCreateCommand } from './commands/agent-create.js';
import { agentListCommand } from './commands/agent-list.js';
import { agentDeleteCommand } from './commands/agent-delete.js';

const VERSION = '1.0.7';

const program = new Command();

program
  .name('tether')
  .description('CLI for tether.name — AI agent identity verification')
  .version(chalk.cyan(BANNER) + `  v${VERSION}\n`, '-v, --version', 'Show version');

// Global options
const addGlobalOpts = (cmd: Command): Command =>
  cmd
    .option('--credential-id <id>', 'Credential ID')
    .option('--key-path <path>', 'Path to private key file')
    .option('--api-key <key>', 'API key for management operations')
    .option('--verbose', 'Enable debug output');

// tether init
program
  .command('init')
  .description('Interactive setup wizard')
  .option('--verbose', 'Enable debug output')
  .action((opts) => initCommand(opts));

// tether verify
addGlobalOpts(
  program
    .command('verify')
    .description('Perform a full identity verification')
    .option('--json', 'Output result as JSON'),
).action((opts) => verifyCommand(opts));

// tether status
addGlobalOpts(
  program
    .command('status')
    .description('Show current configuration')
    .option('--json', 'Output result as JSON'),
).action((opts) => statusCommand(opts));

// tether challenge
addGlobalOpts(
  program
    .command('challenge')
    .description('Request a challenge code from the API'),
).action((opts) => challengeCommand(opts));

// tether sign <challenge>
addGlobalOpts(
  program
    .command('sign <challenge>')
    .description('Sign a challenge string and print the proof'),
).action((challenge, opts) => signCommand(challenge, opts));

// tether check <code>
addGlobalOpts(
  program
    .command('check <code>')
    .description('Check the status of a challenge by code')
    .option('--json', 'Output result as JSON'),
).action((code, opts) => checkCommand(code, opts));

// tether agent (subcommand group)
const agent = program
  .command('agent')
  .description('Manage agents');

// tether agent create <name>
addGlobalOpts(
  agent
    .command('create <name>')
    .description('Create a new agent')
    .option('--description <text>', 'Agent description')
    .option('--json', 'Output result as JSON'),
).action((name, opts) => agentCreateCommand(name, opts));

// tether agent list
addGlobalOpts(
  agent
    .command('list')
    .description('List all agents')
    .option('--json', 'Output result as JSON'),
).action((opts) => agentListCommand(opts));

// tether agent delete <id>
addGlobalOpts(
  agent
    .command('delete <id>')
    .description('Delete an agent by ID')
    .option('--json', 'Output result as JSON'),
).action((id, opts) => agentDeleteCommand(id, opts));

program.parse();
