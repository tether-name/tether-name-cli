# tether-name-cli

CLI for [tether.name](https://tether.name) — AI agent identity verification.

## Install

```bash
npm install -g tether-name-cli
```

Requires Node.js >= 18.

## Quick Start

```bash
# Interactive setup — configure credentials and generate a keypair
tether init

# Verify your agent identity
tether verify
```

## Commands

### `tether init`

Interactive setup wizard. Walks you through:

1. Entering your credential ID (or reads `TETHER_CREDENTIAL_ID`)
2. Providing a private key path (or reads `TETHER_PRIVATE_KEY_PATH`)
3. Optionally generating a new RSA-2048 keypair

Saves configuration to `~/.tether/config.json`.

### `tether verify`

Performs a full verification cycle:

1. Requests a challenge from the Tether API
2. Signs it with your private key
3. Submits proof and displays the result

```bash
tether verify
tether verify --json         # Machine-readable output
tether verify --verbose      # Debug output
```

### `tether status`

Shows current configuration — credential ID (masked), key file path, and API URL.

```bash
tether status
tether status --json
```

### `tether challenge`

Request a challenge code from the API and print it.

```bash
tether challenge
```

### `tether sign <challenge>`

Sign a challenge string with your private key and print the proof.

```bash
tether sign abc123
```

### `tether check <code>`

Check the status of a challenge by its code.

```bash
tether check abc123
tether check abc123 --json
```

## Configuration

Config is resolved in this order (first match wins):

1. **CLI flags** — `--credential-id`, `--key-path`, `--api-url`
2. **Environment variables** — `TETHER_CREDENTIAL_ID`, `TETHER_PRIVATE_KEY_PATH`, `TETHER_API_URL`
3. **Config file** — `~/.tether/config.json`

### Environment Variables

| Variable | Description |
|---|---|
| `TETHER_CREDENTIAL_ID` | Your agent credential ID |
| `TETHER_PRIVATE_KEY_PATH` | Path to your private key file |
| `TETHER_API_URL` | API base URL (default: `https://api.tether.name`) |

## Development

```bash
git clone https://github.com/theJawnnybot/tether-name-cli.git
cd tether-name-cli
npm install
npm run build
npm test
```

## License

MIT
