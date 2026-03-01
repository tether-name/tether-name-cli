import { TetherClient } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

export async function challengeCommand(opts: CLIFlags & { verbose?: boolean }): Promise<void> {
  const config = resolveConfig(opts);

  if (!config.agentId) {
    printError('No agent ID configured. Run "tether init" or set TETHER_AGENT_ID.');
    process.exitCode = 1;
    return;
  }

  if (!config.keyPath) {
    printError('No private key path configured. Run "tether init" or set TETHER_PRIVATE_KEY_PATH.');
    process.exitCode = 1;
    return;
  }

  try {

    const client = new TetherClient({
      agentId: config.agentId,
      privateKeyPath: config.keyPath,
    });

    const code = await client.requestChallenge();
    console.log(code);
  } catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
