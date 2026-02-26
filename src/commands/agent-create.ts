import chalk from 'chalk';
import { TetherClient } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

export async function agentCreateCommand(
  name: string,
  opts: CLIFlags & { description?: string; json?: boolean; verbose?: boolean },
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
    printVerbose(`Creating agent "${name}"...`, verbose);

    const client = new TetherClient({
      apiKey: config.apiKey,
      baseUrl: config.apiUrl,
    });

    const agent = await client.createAgent(name, opts.description || '');

    if (opts.json) {
      console.log(JSON.stringify(agent, null, 2));
    } else {
      console.log();
      console.log(chalk.green.bold('  ✓ Agent created'));
      console.log(chalk.dim('  ' + '─'.repeat(40)));
      console.log(`  ID:                 ${agent.id}`);
      console.log(`  Name:               ${agent.agentName}`);
      if (agent.description) {
        console.log(`  Description:        ${agent.description}`);
      }
      console.log(`  Registration Token: ${chalk.yellow(agent.registrationToken)}`);
      console.log();
      console.log(chalk.dim('  Save the registration token — it cannot be retrieved later.'));
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
