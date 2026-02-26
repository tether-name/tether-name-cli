import { createInterface } from 'readline';
import { generateKeyPairSync } from 'crypto';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { saveConfig, getConfigPath } from '../config.js';

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

    // Credential ID
    const envCredential = process.env.TETHER_CREDENTIAL_ID;
    let credentialId: string;
    if (envCredential) {
      console.log(chalk.dim(`  Using TETHER_CREDENTIAL_ID from environment`));
      credentialId = envCredential;
    } else {
      credentialId = await prompt(rl, '  Credential ID: ');
    }

    if (!credentialId) {
      console.log(chalk.red('\n  Credential ID is required.'));
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
        keyPath = await generateKeypair(opts.verbose);
      } else {
        keyPath = await prompt(rl, '  Path to private key: ');
      }
    }

    if (!keyPath) {
      console.log(chalk.red('\n  Private key path is required.'));
      return;
    }

    keyPath = resolve(keyPath);

    if (!existsSync(keyPath)) {
      console.log(chalk.yellow(`\n  Warning: Key file not found at ${keyPath}`));
    }

    // Save config
    saveConfig({ credentialId, keyPath });

    console.log();
    console.log(chalk.green('  ✓ Configuration saved to ' + getConfigPath()));
    console.log();
  } finally {
    rl.close();
  }
}

function generateKeypair(verbose?: boolean): string {
  const privatePath = resolve('.tether-private-key.pem');
  const publicPath = resolve('.tether-public-key.pem');

  if (verbose) {
    console.log(chalk.dim(`  [debug] Generating RSA-2048 keypair...`));
  }

  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });

  writeFileSync(privatePath, privateKey, { mode: 0o600 });
  writeFileSync(publicPath, publicKey);

  console.log(chalk.green(`  ✓ Private key: ${privatePath}`));
  console.log(chalk.green(`  ✓ Public key:  ${publicPath}`));
  console.log();
  console.log(chalk.dim('  Upload the public key to tether.name to complete registration.'));

  return privatePath;
}
