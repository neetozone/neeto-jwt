# neeto-jwt JS client

This NPM package provides a convenient way to generate JWTs and login URLs for
Neeto applications.

## Installation

```bash
yarn add neeto-jwt
```

## Usage

### 1. Using environment variables.

Set the following environment variables.

```bash
NEETO_JWT_WORKSPACE=spinkart
NEETO_JWT_PRIVATE_KEY=<your_private_key>
```

```js
import NeetoJWT from "neeto-jwt";

const email = "oliver@example.com";

const neetoJWT = new NeetoJWT({ email });

const redirectUri = "https://spinkart.neetocal.com/admin";
const loginUrl = neetoJWT.generateLoginUrl(redirectUri);

console.log("Login URL:", loginUrl);
```

### 2. Using arguments

```js
import NeetoJWT from "neeto-jwt";

const email = "oliver@example.com";
const workspace = "spinkart";
const privateKey = "<your-private-key>";

const neetoJWT = new NeetoJWT({ email, workspace, privateKey });

const redirectUri = "https://spinkart.neetocal.com/admin";
const loginUrl = neetoJWT.generateLoginUrl(redirectUri);

console.log("Login URL:", loginUrl);
```

### Options

- `email` (string, required): The user's email address.
- `workspace` (string, optional): The Neeto workspace. Defaults to the
  NEETO_JWT_WORKSPACE environment variable.
- `privateKey` (string, optional): The private key used to sign the JWT.
  Defaults to the NEETO_JWT_PRIVATE_KEY environment variable.

### Methods

- `generateJWT()`: Generates a JWT token.
- `generateLoginUrl(redirectUri: string)`: Generates a login URL with the JWT
  and redirect URI.

### Environment Variables

- `NEETO_JWT_WORKSPACE`: Sets the default workspace.
- `NEETO_JWT_PRIVATE_KEY`: Sets the default private key.
- `NEETO_JWT_ENV`: Sets the environment for the top level domain, and protocol.
  Can be "development", "staging", or "production". Defaults to production.

## Development

```bash
yarn build
```

This command compiles the TypeScript code into JavaScript in the dist directory.

### Interactive Development

```bash
yarn dev
```

This command starts a Node.js REPL (Read-Eval-Print Loop) with the NeetoJWT
class available in the global scope. This allows you to interactively test and
use the library.

### Tests

```bash
yarn test
```

This command executes the unit tests using Vitest.
