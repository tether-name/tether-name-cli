import { createInterface } from 'readline';
import { generateKeyPairSync } from 'crypto';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join, dirname, sep } from 'path';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { saveConfig, getConfigPath, getConfigDir } from '../config.js';

function prompt(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

export async function initCommand(opts: { verbose?: boolean }): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log();
    console.log(chalk.bold('  Tether Setup'));
    console.log(chalk.dim('  ' + '─'.repeat(30)));
    console.log();

    // Agent ID
    const envAgentId = process.env.TETHER_AGENT_ID;
    let agentId: string;
    if (envAgentId) {
      console.log(chalk.dim(`  Using TETHER_AGENT_ID from environment`));
      agentId = envAgentId;
    } else {
      agentId = await prompt(rl, '  Agent ID: ');
    }

    if (!agentId) {
      console.log(chalk.red('\n  Agent ID is required.'));
      return;
    }

    // Private key
    const envKeyPath = process.env.TETHER_PRIVATE_KEY_PATH;
    let keyPath: string;

    if (envKeyPath) {
      console.log(chalk.dim(`  Using TETHER_PRIVATE_KEY_PATH from environment`));
      keyPath = envKeyPath;
    } else {
      const genAnswer = await prompt(rl, '  Generate a new RSA keypair? (y/N): ');

      if (genAnswer.toLowerCase() === 'y') {
        keyPath = await generateKeypair(agentId, opts.verbose);
      } else {
        keyPath = await prompt(rl, '  Path to private key: ');
      }
    }

    if (!keyPath) {
      console.log(chalk.red('\n  Private key path is required.'));
      return;
    }

    keyPath = resolve(keyPath);

    warnIfKeyPathIsInGitRepo(keyPath);

    if (!existsSync(keyPath)) {
      console.log(chalk.yellow(`\n  Warning: Key file not found at ${keyPath}`));
    }

    // Save config
    saveConfig({ agentId, keyPath });

    console.log();
    console.log(chalk.green('  ✓ Configuration saved to ' + getConfigPath()));
    console.log();
  } finally {
    rl.close();
  }
}

function warnIfKeyPathIsInGitRepo(keyPath: string): void {
  const repoRoot = findGitRootForPath(keyPath);
  if (!repoRoot) return;

  const normalizedRoot = repoRoot.endsWith(sep) ? repoRoot : `${repoRoot}${sep}`;
  if (!keyPath.startsWith(normalizedRoot)) return;

  console.log();
  console.log(chalk.yellow('  ⚠️  Security warning: key path appears inside a git repository.'));
  console.log(chalk.yellow(`     Repo root: ${repoRoot}`));
  console.log(chalk.yellow(`     Key path:  ${keyPath}`));
  console.log(chalk.dim('     This can lead to accidental private-key commits.'));
  console.log(chalk.dim(`     Recommended: store keys under ${join(getConfigDir(), 'keys')}`));
}

function findGitRootForPath(targetPath: string): string | null {
  let cwd = dirname(targetPath);

  // If the path points to a non-existing location, walk up until we find an existing dir.
  while (!existsSync(cwd)) {
    const parent = dirname(cwd);
    if (parent === cwd) return null;
    cwd = parent;
  }

  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  if (result.status !== 0) return null;
  const root = (result.stdout || '').trim();
  return root || null;
}

function generateKeypair(agentId: string, verbose?: boolean): string {
  const keysDir = join(getConfigDir(), 'keys');
  mkdirSync(keysDir, { recursive: true });

  const safeAgent = (agentId || 'agent')
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 48) || 'agent';

  let privatePath = join(keysDir, `${safeAgent}.private.pem`);
  let publicPath = join(keysDir, `${safeAgent}.public.pem`);

  let suffix = 1;
  while (existsSync(privatePath) || existsSync(publicPath)) {
    privatePath = join(keysDir, `${safeAgent}-${suffix}.private.pem`);
    publicPath = join(keysDir, `${safeAgent}-${suffix}.public.pem`);
    suffix += 1;
  }

  if (verbose) {
    console.log(chalk.dim(`  [debug] Generating RSA-2048 keypair...`));
  }

  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  writeFileSync(privatePath, privateKey, { mode: 0o600 });
  writeFileSync(publicPath, publicKey, { mode: 0o644 });

  console.log(chalk.green(`  ✓ Private key: ${privatePath}`));
  console.log(chalk.green(`  ✓ Public key:  ${publicPath}`));
  console.log();
  console.log(chalk.dim('  Keys are stored in ~/.tether/keys (outside your current repo by default).'));
  console.log(chalk.dim('  Upload the public key to tether.name to complete registration.'));

  return privatePath;
}
