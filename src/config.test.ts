import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveConfig } from './config.js';

describe('resolveConfig', () => {
  beforeEach(() => {
    delete process.env.TETHER_CREDENTIAL_ID;
    delete process.env.TETHER_PRIVATE_KEY_PATH;
    delete process.env.TETHER_API_URL;
    delete process.env.TETHER_API_KEY;
  });

  it('returns defaults when no flags, env, or file config provided', () => {
    const config = resolveConfig();
    expect(config.credentialId).toBe('');
    expect(config.keyPath).toBe('');
    expect(config.apiUrl).toBe('https://api.tether.name');
    expect(config.apiKey).toBe('');
  });

  it('uses CLI flags over env vars', () => {
    process.env.TETHER_CREDENTIAL_ID = 'env-id';
    const config = resolveConfig({ credentialId: 'flag-id' });
    expect(config.credentialId).toBe('flag-id');
  });

  it('falls back to env vars when no flags provided', () => {
    process.env.TETHER_CREDENTIAL_ID = 'env-id';
    process.env.TETHER_PRIVATE_KEY_PATH = '/env/key';
    process.env.TETHER_API_URL = 'https://env.example.com';
    process.env.TETHER_API_KEY = 'env-key';

    const config = resolveConfig();
    expect(config.credentialId).toBe('env-id');
    expect(config.keyPath).toBe('/env/key');
    expect(config.apiUrl).toBe('https://env.example.com');
    expect(config.apiKey).toBe('env-key');
  });
});
