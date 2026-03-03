import chalk from 'chalk';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

type RevokeOpts = CLIFlags & {
  reason?: string;
  stepUpCode?: string;
  challenge?: string;
  proof?: string;
  json?: boolean;
  verbose?: boolean;
};

type RevokeResponse = {
  agentId: string;
  keyId: string;
  revoked: boolean;
  promotedKeyId?: string | null;
  message?: string;
};

export async function agentKeyRevokeCommand(
  agentId: string,
  keyId: string,
  opts: RevokeOpts,
): Promise<void> {
  const config = resolveConfig(opts);

  if (!config.apiKey) {
    printError('No API key configured. Set TETHER_API_KEY or pass --api-key.');
    process.exitCode = 1;
    return;
  }

  const verbose = opts.verbose ?? false;

  try {
    printVerbose(`Revoking key ${keyId} for agent ${agentId}...`, verbose);

    const payload = {
      ...(opts.reason ? { reason: opts.reason } : {}),
      ...(opts.stepUpCode ? { stepUpCode: opts.stepUpCode } : {}),
      ...(opts.challenge ? { challenge: opts.challenge } : {}),
      ...(opts.proof ? { proof: opts.proof } : {}),
    };

    const baseUrl = process.env.TETHER_API_URL || 'https://api.tether.name';
    const response = await fetch(`${baseUrl}/agents/${agentId}/keys/${keyId}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Revoke key failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as RevokeResponse;

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log();
    console.log(chalk.green.bold('  ✓ Agent key revoked'));
    console.log(chalk.dim('  ' + '─'.repeat(40)));
    console.log(`  Agent:        ${result.agentId}`);
    console.log(`  Key:          ${result.keyId}`);
    console.log(`  Revoked:      ${result.revoked ? 'yes' : 'no'}`);
    if (result.promotedKeyId) {
      console.log(`  Promoted key: ${result.promotedKeyId}`);
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
