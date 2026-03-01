import chalk from 'chalk';
import type { VerificationResult } from 'tether-name';
import { type TetherConfig } from '../config.js';

export function maskId(id: string): string {
  if (id.length <= 4) return id;
  return '••••' + id.slice(-4);
}

export function printVerifyResult(result: VerificationResult): void {
  const width = 48;
  const hr = '─'.repeat(width);

  console.log();
  if (result.verified) {
    console.log(chalk.green('┌' + hr + '┐'));
    console.log(chalk.green('│') + center(chalk.green.bold('✓ Identity Verified'), width, 19) + chalk.green('│'));
    console.log(chalk.green('├' + hr + '┤'));

    if (result.agentName) {
      console.log(chalk.green('│') + padLine(`  Agent:  ${result.agentName}`, width) + chalk.green('│'));
    }
    if (result.verifyUrl) {
      console.log(chalk.green('│') + padLine(`  URL:    ${result.verifyUrl}`, width) + chalk.green('│'));
    }
    if (result.registeredSince) {
      const date = formatDate(result.registeredSince);
      console.log(chalk.green('│') + padLine(`  Since:  ${date}`, width) + chalk.green('│'));
    }

    console.log(chalk.green('└' + hr + '┘'));
  } else {
    console.log(chalk.red('┌' + hr + '┐'));
    console.log(chalk.red('│') + center(chalk.red.bold('✗ Verification Failed'), width, 21) + chalk.red('│'));
    console.log(chalk.red('├' + hr + '┤'));

    if (result.error) {
      console.log(chalk.red('│') + padLine(`  ${result.error}`, width) + chalk.red('│'));
    }

    console.log(chalk.red('└' + hr + '┘'));
  }
  console.log();
}

export function printVerifyResultJSON(result: VerificationResult): void {
  console.log(JSON.stringify(result, null, 2));
}

export function printStatus(config: TetherConfig, keyExists: boolean): void {
  console.log();
  console.log(chalk.bold('  Tether Configuration'));
  console.log(chalk.dim('  ' + '─'.repeat(30)));
  console.log(`  Credential:  ${config.credentialId ? maskId(config.credentialId) : chalk.dim('(not set)')}`);
  console.log(`  Key path:    ${config.keyPath || chalk.dim('(not set)')}`);
  if (config.keyPath) {
    console.log(`  Key exists:  ${keyExists ? chalk.green('yes') : chalk.red('no')}`);
  }
  console.log();
}

export function printStatusJSON(config: TetherConfig, keyExists: boolean): void {
  console.log(JSON.stringify({
    credentialId: config.credentialId ? maskId(config.credentialId) : null,
    keyPath: config.keyPath || null,
    keyExists,
  }, null, 2));
}

export function printError(message: string): void {
  console.error(chalk.red(`Error: ${message}`));
}

export function printVerbose(message: string, verbose: boolean): void {
  if (verbose) {
    console.error(chalk.dim(`[debug] ${message}`));
  }
}

export const BANNER = `
  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╦═╗
   ║ ║╣  ║ ╠═╣║╣ ╠╦╝
   ╩ ╚═╝ ╩ ╩ ╩╚═╝╩╚═
`;

function padLine(text: string, width: number): string {
  const visible = stripAnsi(text);
  const pad = width - visible.length;
  return text + ' '.repeat(Math.max(0, pad));
}

function center(text: string, width: number, visibleLength: number): string {
  const leftPad = Math.floor((width - visibleLength) / 2);
  const rightPad = width - visibleLength - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
