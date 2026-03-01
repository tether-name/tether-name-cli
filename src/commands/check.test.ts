import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkCommand, formatEpochMs } from './check.js';

// ── formatEpochMs ──────────────────────────────────────────────

describe('formatEpochMs', () => {
  it('converts epoch ms to ISO string', () => {
    // 2026-01-15T00:00:00.000Z
    expect(formatEpochMs(1768435200000)).toBe('2026-01-15T00:00:00.000Z');
  });

  it('returns null for undefined', () => {
    expect(formatEpochMs(undefined)).toBeNull();
  });

  it('returns null for NaN', () => {
    expect(formatEpochMs(NaN)).toBeNull();
  });

  it('handles zero (unix epoch)', () => {
    expect(formatEpochMs(0)).toBe('1970-01-01T00:00:00.000Z');
  });
});

// ── checkCommand ───────────────────────────────────────────────

// Helper to capture console.log output
function captureConsole() {
  const lines: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    lines.push(args.map(String).join(' '));
  });
  return { lines, spy };
}

function mockFetchResponse(body: object, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
}

describe('checkCommand', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.exitCode = undefined as unknown as number;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('displays a pending challenge status', async () => {
    const apiResponse = {
      challenge: 'abc-123',
      status: 'pending',
      createdAt: 1768435200000,
    };
    globalThis.fetch = mockFetchResponse(apiResponse);
    const { lines, spy } = captureConsole();

    await checkCommand('abc-123', {});

    const output = lines.join('\n');
    expect(output).toContain('abc-123');
    expect(output).toContain('pending');
    expect(output).toContain('2026-01-15T00:00:00.000Z');
    expect(output).not.toContain('Agent');
    expect(output).not.toContain('Verified');

    spy.mockRestore();
  });

  it('displays a verified challenge with agent name', async () => {
    const apiResponse = {
      challenge: 'xyz-456',
      status: 'verified',
      createdAt: 1768435200000,
      verifiedAt: 1768435260000,
      agentName: 'TestBot',
    };
    globalThis.fetch = mockFetchResponse(apiResponse);
    const { lines, spy } = captureConsole();

    await checkCommand('xyz-456', {});

    const output = lines.join('\n');
    expect(output).toContain('xyz-456');
    expect(output).toContain('verified');
    expect(output).toContain('TestBot');
    expect(output).toContain('Verified');

    spy.mockRestore();
  });

  it('outputs raw JSON when --json flag is set', async () => {
    const apiResponse = {
      challenge: 'abc-123',
      status: 'pending',
      createdAt: 1768435200000,
    };
    globalThis.fetch = mockFetchResponse(apiResponse);
    const { lines, spy } = captureConsole();

    await checkCommand('abc-123', { json: true });

    const output = lines.join('\n');
    const parsed = JSON.parse(output);
    expect(parsed.challenge).toBe('abc-123');
    expect(parsed.status).toBe('pending');
    expect(parsed.createdAt).toBe(1768435200000);

    spy.mockRestore();
  });

  it('sets exit code on API error', async () => {
    globalThis.fetch = mockFetchResponse({ error: 'not found' }, 404);
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await checkCommand('bad-code', {});

    expect(process.exitCode).toBe(1);

    errSpy.mockRestore();
  });

  it('sets exit code on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await checkCommand('abc-123', {});

    expect(process.exitCode).toBe(1);

    errSpy.mockRestore();
  });

  it('calls the correct URL with encoded challenge code', async () => {
    const apiResponse = { challenge: 'a/b c', status: 'pending' };
    globalThis.fetch = mockFetchResponse(apiResponse);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await checkCommand('a/b c', {});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/challenge/a%2Fb%20c'),
      expect.any(Object),
    );

    vi.restoreAllMocks();
  });


});
