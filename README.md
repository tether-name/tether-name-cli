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
# Interactive setup — configure your agent ID and generate a keypair
tether init

# Verify your agent identity
tether verify
```

## Commands

### `tether init`

Interactive setup wizard. Walks you through configuring your agent ID, private key path, and optionally generates a new RSA-2048 key pair.

Generated keys are saved to `~/.tether/keys/` by default (not your current working directory) to reduce accidental git commits.

Saves configuration to `~/.tether/config.json`.

### `tether verify`

Perform a full identity verification — requests a challenge, signs it, submits proof, and displays the result.

```bash
tether verify
tether verify --json    # Machine-readable output
```

### `tether status`

Show your current configuration — agent ID (masked) and key file path.

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

1. **CLI flags** — `--agent-id`, `--key-path`, `--api-key`
2. **Environment variables** — `TETHER_AGENT_ID`, `TETHER_PRIVATE_KEY_PATH`, `TETHER_API_KEY`
3. **Config file** — `~/.tether/config.json` (created by `tether init`)

### Global Flags

| Flag | Description |
|---|---|
| `--agent-id <id>` | Override agent ID |
| `--key-path <path>` | Override private key file path |
| `--api-key <key>` | Override API key |
| `--verbose` | Enable debug output |
| `--json` | Machine-readable JSON output (on supported commands) |

### Agent Management

Requires an API key (`--api-key`, `TETHER_API_KEY` env var, or config file).

#### `tether agent create <name>`

Create a new agent.

```bash
tether agent create "my-bot" --description "My helpful bot"
tether agent create "my-bot" --domain-id "domain-id"   # Assign a verified domain
tether agent create "my-bot" --json
```

Returns the agent's ID, name, and a **registration token** (save it — it can't be retrieved later).

#### `tether agent list`

List all agents.

```bash
tether agent list
tether agent list --json
```

#### `tether agent delete <id>`

Delete an agent by ID.

```bash
tether agent delete "agent-id"
tether agent delete "agent-id" --json
```

#### `tether agent keys <agentId>`

List key lifecycle entries for an agent (`active`, `grace`, `revoked`).

```bash
tether agent keys "agent-id"
tether agent keys "agent-id" --json
```

#### `tether agent rotate-key <agentId>`

Rotate an agent key. Requires step-up verification via either `--step-up-code` or `--challenge` + `--proof`.

```bash
tether agent rotate-key "agent-id" \
  --public-key "BASE64_SPKI_PUBLIC_KEY" \
  --grace-hours 24 \
  --step-up-code 123456
```

#### `tether agent revoke-key <agentId> <keyId>`

Revoke a specific key. Requires step-up verification via either `--step-up-code` or `--challenge` + `--proof`.

```bash
tether agent revoke-key "agent-id" "key-id" \
  --reason "compromised" \
  --step-up-code 123456
```

### Domain Management

#### `tether domain list`

List all registered domains for your account.

```bash
tether domain list
tether domain list --json
```

Use the domain ID with `tether agent create --domain-id` to assign a domain to an agent. Domains are claimed and verified via the [web dashboard](https://tether.name/dashboard).

## Example Workflow

```bash
# 1. Set up your agent
tether init

# 2. Check your config
tether status

# 3. Verify your identity
tether verify

# 4. Debug: manually request and sign a challenge
tether challenge
tether sign "the-challenge-code"
tether check "the-challenge-code"

# 5. Agent management (requires API key)
tether agent create "my-bot" --description "Helpful assistant"
tether domain list
tether agent create "my-bot" --domain-id "abc123"
tether agent list
tether agent keys "agent-id"
tether agent rotate-key "agent-id" --public-key "BASE64_SPKI_PUBLIC_KEY" --step-up-code 123456
tether agent revoke-key "agent-id" "key-id" --reason "compromised" --step-up-code 123456
tether agent delete "agent-id"
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
