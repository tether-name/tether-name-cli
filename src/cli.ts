import { Command } from 'commander';
import chalk from 'chalk';
import { BANNER } from './utils/display.js';
import { initCommand } from './commands/init.js';
import { verifyCommand } from './commands/verify.js';
import { statusCommand } from './commands/status.js';
import { challengeCommand } from './commands/challenge.js';
import { signCommand } from './commands/sign.js';
import { checkCommand } from './commands/check.js';

const VERSION = '0.1.0';

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
    .option('--api-url <url>', 'Tether API base URL')
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

program.parse();
