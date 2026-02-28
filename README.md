# tether-name-cli

[![npm](https://img.shields.io/npm/v/tether-name-cli)](https://www.npmjs.com/package/tether-name-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI for [tether.name](https://tether.name) — AI agent identity verification.

## Install

```bash
npm install -g tether-name-cli
```

Or use without installing:

```bash
npx tether-name-cli verify
```

Requires Node.js >= 20.

## Quick Start

```bash
# Interactive setup — configure credentials and generate a keypair
tether init

# Verify your agent identity
tether verify
```

## Commands

### `tether init`

Interactive setup wizard. Walks you through configuring your credential ID, private key path, and optionally generates a new RSA-2048 key pair.

Saves configuration to `~/.tether/config.json`.

### `tether verify`

Perform a full identity verification — requests a challenge, signs it, submits proof, and displays the result.

```bash
tether verify
tether verify --json    # Machine-readable output
```

### `tether status`

Show your current configuration — credential ID (masked), key file path, and API URL.

```bash
tether status
tether status --json
```

### `tether challenge`

Request a new challenge code from the Tether API and print it.

```bash
tether challenge
```

### `tether sign <challenge>`

Sign a challenge string with your private key and print the proof.

```bash
tether sign "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### `tether check <code>`

Check the status of a challenge by its code.

```bash
tether check "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
tether check "a1b2c3d4-e5f6-7890-abcd-ef1234567890" --json
```

## Configuration

The CLI resolves configuration in this order (first wins):

1. **CLI flags** — `--credential-id`, `--key-path`, `--api-url`, `--api-key`
2. **Environment variables** — `TETHER_CREDENTIAL_ID`, `TETHER_PRIVATE_KEY_PATH`, `TETHER_API_URL`, `TETHER_API_KEY`
3. **Config file** — `~/.tether/config.json` (created by `tether init`)
4. **Built-in defaults** — e.g. API URL defaults to `https://api.tether.name`

### Global Flags

| Flag | Description |
|---|---|
| `--credential-id <id>` | Override credential ID |
| `--key-path <path>` | Override private key file path |
| `--api-url <url>` | Override API base URL |
| `--api-key <key>` | Override API key |
| `--verbose` | Enable debug output |
| `--json` | Machine-readable JSON output (on supported commands) |

## Example Workflow

```bash
# 1. Set up credentials
tether init

# 2. Check your config
tether status

# 3. Verify your identity
tether verify

# 4. Debug: manually request and sign a challenge
tether challenge
tether sign "the-challenge-code"
tether check "the-challenge-code"
```

## Publishing

Published to npm automatically via GitHub Actions when a release is created.

### Version checklist

Update the version in:

1. `package.json` → `"version"`
2. `src/cli.ts` → `VERSION` constant

### Steps

1. Update version numbers above (they must match)
2. Commit and push to `main`
3. Create a GitHub release with a matching tag (e.g. `v1.0.0`)
4. CI builds and publishes to npm automatically

### Manual publish (if needed)

```bash
npm run build
npm publish --access public
```

## Documentation

Full documentation at [docs.tether.name](https://docs.tether.name/cli/).

## License

[MIT](LICENSE)

## Links

- 🌐 [Tether Website](https://tether.name)
- 📘 [Documentation](https://docs.tether.name)
- 📦 [npm Package](https://www.npmjs.com/package/tether-name-cli)
- 💻 [GitHub](https://github.com/tether-name/tether-name-cli)
