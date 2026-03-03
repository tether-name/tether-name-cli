import chalk from 'chalk';
import { readFileSync } from 'fs';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

type RotateOpts = CLIFlags & {
  publicKey?: string;
  publicKeyPath?: string;
  graceHours?: string;
  reason?: string;
  stepUpCode?: string;
  challenge?: string;
  proof?: string;
  json?: boolean;
  verbose?: boolean;
};

type RotateResponse = {
  agentId: string;
  previousKeyId?: string | null;
  newKeyId: string;
  graceUntil: number;
  message?: string;
};

export async function agentKeyRotateCommand(
  agentId: string,
  opts: RotateOpts,
): Promise<void> {
  const config = resolveConfig(opts);

  if (!config.apiKey) {
    printError('No API key configured. Set TETHER_API_KEY or pass --api-key.');
    process.exitCode = 1;
    return;
  }

  const verbose = opts.verbose ?? false;

  try {
    const publicKey = resolvePublicKey(opts);
    if (!publicKey) {
      printError('Provide --public-key or --public-key-path for key rotation.');
      process.exitCode = 1;
      return;
    }

    const gracePeriodHours = opts.graceHours ? parseInt(opts.graceHours, 10) : undefined;
    if (opts.graceHours && Number.isNaN(gracePeriodHours)) {
      printError('--grace-hours must be a number.');
      process.exitCode = 1;
      return;
    }

    printVerbose(`Rotating key for agent ${agentId}...`, verbose);

    const payload = {
      publicKey,
      ...(gracePeriodHours !== undefined ? { gracePeriodHours } : {}),
      ...(opts.reason ? { reason: opts.reason } : {}),
      ...(opts.stepUpCode ? { stepUpCode: opts.stepUpCode } : {}),
      ...(opts.challenge ? { challenge: opts.challenge } : {}),
      ...(opts.proof ? { proof: opts.proof } : {}),
    };

    const baseUrl = process.env.TETHER_API_URL || 'https://api.tether.name';
    const response = await fetch(`${baseUrl}/agents/${agentId}/keys/rotate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Rotate key failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as RotateResponse;

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log();
    console.log(chalk.green.bold('  ✓ Agent key rotated'));
    console.log(chalk.dim('  ' + '─'.repeat(40)));
    console.log(`  Agent:        ${result.agentId}`);
    if (result.previousKeyId) {
      console.log(`  Previous key: ${result.previousKeyId}`);
    }
    console.log(`  New key:      ${result.newKeyId}`);
    if (result.graceUntil) {
      console.log(`  Grace until:  ${new Date(result.graceUntil).toLocaleString('en-US')}`);
    }
    if (result.message) {
      console.log(`  Message:      ${result.message}`);
    }
    console.log();
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

function resolvePublicKey(opts: RotateOpts): string {
  if (opts.publicKeyPath) {
    try {
      return readFileSync(opts.publicKeyPath, 'utf-8').trim();
    } catch {
      return '';
    }
  }

  if (opts.publicKey) {
    return opts.publicKey.trim();
  }

  return '';
}
