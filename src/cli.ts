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
import { agentKeyListCommand } from './commands/agent-key-list.js';
import { agentKeyRotateCommand } from './commands/agent-key-rotate.js';
import { agentKeyRevokeCommand } from './commands/agent-key-revoke.js';
import { domainListCommand } from './commands/domain-list.js';

const VERSION = '2.0.7';

const program = new Command();

program
  .name('tether')
  .description('CLI for tether.name — AI agent identity verification')
  .version(chalk.cyan(BANNER) + `  v${VERSION}\n`, '-v, --version', 'Show version');

// Global options
const addGlobalOpts = (cmd: Command): Command =>
  cmd
    .option('--agent-id <id>', 'Agent ID')
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
    .option('--domain-id <id>', 'Assign a verified domain to this agent')
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

// tether agent key list <agent-id>
addGlobalOpts(
  agent
    .command('keys <agentId>')
    .description('List key lifecycle entries for an agent')
    .option('--json', 'Output result as JSON'),
).action((agentId, opts) => agentKeyListCommand(agentId, opts));

// tether agent key rotate <agent-id>
addGlobalOpts(
  agent
    .command('rotate-key <agentId>')
    .description('Rotate an agent public key (requires step-up)')
    .requiredOption('--public-key <key>', 'New base64 SPKI public key')
    .option('--public-key-path <path>', 'Read new public key from file path (overrides --public-key)')
    .option('--grace-hours <hours>', 'Grace overlap window in hours (default 24)')
    .option('--reason <text>', 'Rotation reason')
    .option('--step-up-code <code>', 'Step-up email code')
    .option('--challenge <code>', 'Challenge code for key-proof step-up')
    .option('--proof <signature>', 'Signature over challenge for key-proof step-up')
    .option('--json', 'Output result as JSON'),
).action((agentId, opts) => agentKeyRotateCommand(agentId, opts));

// tether agent key revoke <agent-id> <key-id>
addGlobalOpts(
  agent
    .command('revoke-key <agentId> <keyId>')
    .description('Revoke an agent key (requires step-up)')
    .option('--reason <text>', 'Revocation reason')
    .option('--step-up-code <code>', 'Step-up email code')
    .option('--challenge <code>', 'Challenge code for key-proof step-up')
    .option('--proof <signature>', 'Signature over challenge for key-proof step-up')
    .option('--json', 'Output result as JSON'),
).action((agentId, keyId, opts) => agentKeyRevokeCommand(agentId, keyId, opts));

// tether domain (subcommand group)
const domain = program
  .command('domain')
  .description('Manage domains');

// tether domain list
addGlobalOpts(
  domain
    .command('list')
    .description('List all verified domains')
    .option('--json', 'Output result as JSON'),
).action((opts) => domainListCommand(opts));

program.parse();
