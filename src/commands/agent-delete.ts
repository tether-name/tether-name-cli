import chalk from 'chalk';
import { TetherClient } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

export async function agentDeleteCommand(
  id: string,
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
    printVerbose(`API URL: ${config.apiUrl}`, verbose);
    printVerbose(`Deleting agent ${id}...`, verbose);

    const client = new TetherClient({
      apiKey: config.apiKey,
      baseUrl: config.apiUrl,
    });

    await client.deleteAgent(id);

    if (opts.json) {
      console.log(JSON.stringify({ deleted: true, id }, null, 2));
    } else {
      console.log();
      console.log(chalk.green.bold('  ✓ Agent deleted'));
      console.log(chalk.dim(`  ID: ${id}`));
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
