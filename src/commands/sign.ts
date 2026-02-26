import { loadPrivateKey, signChallenge } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printError, printVerbose } from '../utils/display.js';

export function signCommand(challenge: string, opts: CLIFlags & { verbose?: boolean }): void {
  const config = resolveConfig(opts);

  if (!config.keyPath) {
    printError('No private key path configured. Run "tether init" or set TETHER_PRIVATE_KEY_PATH.');
    process.exitCode = 1;
    return;
  }

  try {
    printVerbose(`Key path: ${config.keyPath}`, opts.verbose ?? false);

    const privateKey = loadPrivateKey({ keyPath: config.keyPath });
    const proof = signChallenge(privateKey, challenge);
    console.log(proof);
  } catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
