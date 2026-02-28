import { TetherClient } from 'tether-name';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printVerifyResult, printVerifyResultJSON, printError, printVerbose } from '../utils/display.js';

export async function verifyCommand(opts: CLIFlags & { json?: boolean; verbose?: boolean }): Promise<void> {
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

  const verbose = opts.verbose ?? false;

  try {
    printVerbose(`Credential ID: ${config.credentialId}`, verbose);
    printVerbose(`Key path: ${config.keyPath}`, verbose);

    const client = new TetherClient({
      credentialId: config.credentialId,
      privateKeyPath: config.keyPath,
    });

    printVerbose('Requesting challenge...', verbose);
    const challenge = await client.requestChallenge();
    printVerbose(`Challenge: ${challenge}`, verbose);

    printVerbose('Signing challenge...', verbose);
    const proof = client.sign(challenge);
    printVerbose(`Proof: ${proof.slice(0, 32)}...`, verbose);

    printVerbose('Submitting proof...', verbose);
    const result = await client.submitProof(challenge, proof);

    if (opts.json) {
      printVerifyResultJSON(result);
    } else {
      printVerifyResult(result);
    }

    if (!result.verified) {
      process.exitCode = 1;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (opts.json) {
      console.log(JSON.stringify({ verified: false, error: message }, null, 2));
    } else {
      printError(message);
    }
    process.exitCode = 1;
  }
}
