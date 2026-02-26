import chalk from 'chalk';
import { TetherClient } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

export async function agentListCommand(
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
    printVerbose('Listing agents...', verbose);

    const client = new TetherClient({
      apiKey: config.apiKey,
      baseUrl: config.apiUrl,
    });

    const agents = await client.listAgents();

    if (opts.json) {
      console.log(JSON.stringify(agents, null, 2));
    } else if (agents.length === 0) {
      console.log();
      console.log(chalk.dim('  No agents found.'));
      console.log();
    } else {
      console.log();
      console.log(chalk.bold(`  Agents (${agents.length})`));
      console.log(chalk.dim('  ' + '─'.repeat(40)));
      for (const agent of agents) {
        const date = formatDate(agent.createdAt);
        console.log(`  ${chalk.cyan(agent.agentName)} ${chalk.dim(`(${agent.id})`)}`);
        if (agent.description) {
          console.log(`    ${agent.description}`);
        }
        console.log(`    Created: ${date}`);
        if (agent.lastVerifiedAt) {
          console.log(`    Last verified: ${formatDate(agent.lastVerifiedAt)}`);
        }
        console.log();
      }
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
  try {
    return new Date(ts).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return String(ts);
  }
}
