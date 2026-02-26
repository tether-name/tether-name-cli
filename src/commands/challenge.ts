import { TetherClient } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

export async function challengeCommand(opts: CLIFlags & { verbose?: boolean }): Promise<void> {
  const config = resolveConfig(opts);

  if (!config.credentialId) {
    printError('No credential ID configured. Run "tether init" or set TETHER_CREDENTIAL_ID.');
    process.exitCode = 1;
    return;
  }

  if (!config.keyPath) {
    printError('No private key path configured. Run "tether init" or set TETHER_PRIVATE_KEY_PATH.');
    process.exitCode = 1;
    return;
  }

  try {
    printVerbose(`API URL: ${config.apiUrl}`, opts.verbose ?? false);

    const client = new TetherClient({
      credentialId: config.credentialId,
      privateKeyPath: config.keyPath,
      baseUrl: config.apiUrl,
    });

    const code = await client.requestChallenge();
    console.log(code);
  } catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
