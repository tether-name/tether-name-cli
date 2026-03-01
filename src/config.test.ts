import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveConfig } from './config.js';

describe('resolveConfig', () => {
  beforeEach(() => {
    delete process.env.TETHER_AGENT_ID;
    delete process.env.TETHER_PRIVATE_KEY_PATH;
    delete process.env.TETHER_API_KEY;
  });

  it('returns defaults when no flags, env, or file config provided', () => {
    const config = resolveConfig();
    expect(config.agentId).toBe('');
    expect(config.keyPath).toBe('');
    expect(config.apiKey).toBe('');
  });

  it('uses CLI flags over env vars', () => {
    process.env.TETHER_AGENT_ID = 'env-id';
    const config = resolveConfig({ agentId: 'flag-id' });
    expect(config.agentId).toBe('flag-id');
  });

  it('falls back to env vars when no flags provided', () => {
    process.env.TETHER_AGENT_ID = 'env-id';
    process.env.TETHER_PRIVATE_KEY_PATH = '/env/key';
    process.env.TETHER_API_KEY = 'env-key';

    const config = resolveConfig();
    expect(config.agentId).toBe('env-id');
    expect(config.keyPath).toBe('/env/key');
    expect(config.apiKey).toBe('env-key');
  });
});
