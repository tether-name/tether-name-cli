import { existsSync } from 'fs';
import { resolveConfig, type CLIFlags } from '../config.js';
import { printStatus, printStatusJSON } from '../utils/display.js';

export function statusCommand(opts: CLIFlags & { json?: boolean }): void {
  const config = resolveConfig(opts);
  const keyExists = config.keyPath ? existsSync(config.keyPath) : false;

  if (opts.json) {
    printStatusJSON(config, keyExists);
  } else {
    printStatus(config, keyExists);
  }
}
