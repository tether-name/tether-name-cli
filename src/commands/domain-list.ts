import chalk from 'chalk';
import { TetherClient } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

export async function domainListCommand(
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
    printVerbose('Listing domains...', verbose);

    const client = new TetherClient({
      apiKey: config.apiKey,
    });

    const domains = await client.listDomains();

    if (opts.json) {
      console.log(JSON.stringify(domains, null, 2));
    } else if (domains.length === 0) {
      console.log();
      console.log(chalk.dim('  No domains found.'));
      console.log(chalk.dim('  Claim domains at https://tether.name/dashboard'));
      console.log();
    } else {
      console.log();
      console.log(chalk.bold(`  Domains (${domains.length})`));
      console.log(chalk.dim('  ' + '─'.repeat(40)));
      for (const domain of domains) {
        const status = domain.verified
          ? chalk.green('✓ verified')
          : chalk.yellow('⏳ pending');
        console.log(`  ${chalk.cyan(domain.domain)} ${status} ${chalk.dim(`(${domain.id})`)}`);
        if (domain.verified && domain.verifiedAt) {
          console.log(`    Verified: ${formatDate(domain.verifiedAt)}`);
        }
        console.log(`    Created: ${formatDate(domain.createdAt)}`);
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
