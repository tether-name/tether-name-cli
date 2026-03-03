import chalk from 'chalk';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

type AgentKeyRow = {
  id: string;
  status: string;
  createdAt: number;
  activatedAt: number;
  graceUntil: number;
  revokedAt: number;
  revokedReason?: string;
};

export async function agentKeyListCommand(
  agentId: string,
  opts: CLIFlags & { json?: boolean; verbose?: boolean },
): Promise<void> {
  const config = resolveConfig(opts);

  if (!config.apiKey) {
    printError('No API key configured. Set TETHER_API_KEY or pass --api-key.');
    process.exitCode = 1;
    return;
  }

  const verbose = opts.verbose ?? false;

  try {
    printVerbose(`Listing keys for agent ${agentId}...`, verbose);

    const baseUrl = process.env.TETHER_API_URL || 'https://api.tether.name';
    const response = await fetch(`${baseUrl}/agents/${agentId}/keys`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`List agent keys failed: ${response.status} ${response.statusText}`);
    }

    const keys = await response.json() as AgentKeyRow[];

    if (opts.json) {
      console.log(JSON.stringify(keys, null, 2));
      return;
    }

    if (keys.length === 0) {
      console.log();
      console.log(chalk.dim(`  No keys found for agent ${agentId}.`));
      console.log();
      return;
    }

    console.log();
    console.log(chalk.bold(`  Agent Keys (${keys.length})`));
    console.log(chalk.dim('  ' + '─'.repeat(46)));

    for (const key of keys) {
      const status =
        key.status === 'active'
          ? chalk.green('active')
          : key.status === 'grace'
            ? chalk.yellow('grace')
            : chalk.red('revoked');

      console.log(`  ${chalk.cyan(key.id)}  ${status}`);
      console.log(`    Created:   ${formatDate(key.createdAt)}`);
      console.log(`    Activated: ${formatDate(key.activatedAt)}`);
      if (key.graceUntil) {
        console.log(`    Grace to:  ${formatDate(key.graceUntil)}`);
      }
      if (key.revokedAt) {
        console.log(`    Revoked:   ${formatDate(key.revokedAt)}`);
      }
      if (key.revokedReason) {
        console.log(`    Reason:    ${key.revokedReason}`);
      }
      console.log();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (opts.json) {
      console.log(JSON.stringify({ error: message }, null, 2));
    } else {
      printError(message);
    }
    process.exitCode = 1;
  }
}

function formatDate(ts: number): string {
  if (!ts) return '-';
  try {
    return new Date(ts).toLocaleString('en-US');
  } catch {
    return String(ts);
  }
}
