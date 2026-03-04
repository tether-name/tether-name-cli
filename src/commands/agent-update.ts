import chalk from 'chalk';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

type UpdateOpts = CLIFlags & {
  domainId?: string;
  showEmail?: boolean;
  json?: boolean;
  verbose?: boolean;
};

type UpdateResponse = {
  id: string;
  domainId?: string;
  domain?: string | null;
  message?: string;
};

export async function agentUpdateCommand(
  agentId: string,
  opts: UpdateOpts,
): Promise<void> {
  const config = resolveConfig(opts);

  if (!config.apiKey) {
    printError('No API key configured. Set TETHER_API_KEY or pass --api-key.');
    process.exitCode = 1;
    return;
  }

  const verbose = opts.verbose ?? false;

  const wantsEmail = Boolean(opts.showEmail);
  const wantsDomain = Boolean(opts.domainId && opts.domainId.trim());

  if (!wantsEmail && !wantsDomain) {
    printError('Provide --domain-id <id> to show a verified domain, or --show-email to show account email.');
    process.exitCode = 1;
    return;
  }

  if (wantsEmail && wantsDomain) {
    printError('Use either --domain-id OR --show-email, not both.');
    process.exitCode = 1;
    return;
  }

  const domainId = wantsEmail ? '' : (opts.domainId || '').trim();

  try {
    printVerbose(`Updating agent ${agentId}...`, verbose);

    const baseUrl = process.env.TETHER_API_URL || 'https://api.tether.name';
    const response = await fetch(`${baseUrl}/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ domainId }),
    });

    if (!response.ok) {
      throw new Error(`Update agent failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as UpdateResponse;

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log();
    console.log(chalk.green.bold('  ✓ Agent updated'));
    console.log(chalk.dim('  ' + '─'.repeat(40)));
    console.log(`  Agent:        ${result.id}`);
    console.log(`  Showing:      ${result.domain ? `domain (${result.domain})` : 'account email'}`);
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
