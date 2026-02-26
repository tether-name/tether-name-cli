import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface TetherConfig {
  credentialId: string;
  keyPath: string;
  apiUrl: string;
  apiKey: string;
}

export interface CLIFlags {
  credentialId?: string;
  keyPath?: string;
  apiUrl?: string;
  apiKey?: string;
}

const CONFIG_DIR = join(homedir(), '.tether');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const DEFAULT_API_URL = 'https://api.tether.name';

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function loadConfigFile(): Partial<TetherConfig> {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveConfig(config: Partial<TetherConfig>): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function resolveConfig(flags: CLIFlags = {}): TetherConfig {
  const file = loadConfigFile();

  return {
    credentialId:
      flags.credentialId ||
      process.env.TETHER_CREDENTIAL_ID ||
      file.credentialId ||
      '',
    keyPath:
      flags.keyPath ||
      process.env.TETHER_PRIVATE_KEY_PATH ||
      file.keyPath ||
      '',
    apiUrl:
      flags.apiUrl ||
      process.env.TETHER_API_URL ||
      file.apiUrl ||
      DEFAULT_API_URL,
    apiKey:
      flags.apiKey ||
      process.env.TETHER_API_KEY ||
      file.apiKey ||
      '',
  };
}
