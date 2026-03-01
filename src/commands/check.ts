import chalk from 'chalk';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

interface ChallengeStatusResponse {
  code: string;
  status: string;
  credentialId?: string;
  createdAt?: string;
  verifiedAt?: string;
  [key: string]: unknown;
}

export async function checkCommand(
  code: string,
  opts: CLIFlags & { json?: boolean; verbose?: boolean },
): Promise<void> {
  const config = resolveConfig(opts);
  const baseUrl = config.apiUrl;
  const verbose = opts.verbose ?? false;

  try {
    const url = `${baseUrl}/challenge/${encodeURIComponent(code)}`;
    printVerbose(`GET ${url}`, verbose);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      printError(`API returned ${response.status}: ${text || response.statusText}`);
      process.exitCode = 1;
      return;
    }

    const data = (await response.json()) as ChallengeStatusResponse;

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log();
      console.log(chalk.bold('  Challenge Status'));
      console.log(chalk.dim('  ' + '─'.repeat(30)));
      console.log(`  Code:     ${data.code}`);
      console.log(`  Status:   ${data.status}`);
      if (data.createdAt) {
        console.log(`  Created:  ${data.createdAt}`);
      }
      if (data.verifiedAt) {
        console.log(`  Verified: ${data.verifiedAt}`);
      }
      console.log();
    }
  } catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
