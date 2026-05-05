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

### 3. Logging in a consumer (instead of a workspace user)

NeetoAuth distinguishes between **users** (members of a workspace) and
**consumers** (end-customers of a Neeto product, e.g. a NeetoEngage upvoter).
To mint a JWT for a consumer, pass `scope: "consumer"`. All consumers live
under the `app` workspace.

```js
import NeetoJWT from "neeto-jwt";

const neetoJWT = new NeetoJWT({
  email: "consumer@example.com",
  privateKey: "<your-private-key>",
  scope: "consumer",
});

const loginUrl = neetoJWT.generateLoginUrl(
  "https://your-partner-app.example.com/post-login"
);
// => https://app.neetoauth.com/consumers/auth/jwt?...
```

When `scope: "consumer"` is set and `workspace` is omitted, the client defaults
to `"app"` (the only workspace consumers belong to in NeetoAuth) instead of
reading `NEETO_JWT_WORKSPACE`. This avoids accidentally pointing the consumer
flow at a tenant-specific workspace if you've already configured the env var
for the user-scope flow.

#### Identity is asserted, not pre-required

Unlike user-scope JWT (where the email must already be invited to the
workspace), consumer-scope JWT lets NeetoAuth **auto-create** the consumer if
the email is unknown — mirroring the existing self-serve OTP and Google
consumer signup flows. First-time consumers are bounced to a one-time profile
completion screen (name + country + time zone) and then redirected to the
`redirectUri` you passed in. Returning consumers skip the profile step
entirely and land directly on `redirectUri` with an active session.

#### Redirect URI

For consumer scope, the `redirectUri` is passed through verbatim to NeetoAuth
and used as the post-login destination. The redirect URI does **not** need to
be a Neeto subdomain — any URL the partner controls works.

### Options

- `email` (string, required): The user's email address.
- `workspace` (string, optional): The Neeto workspace. For user scope, defaults
  to the `NEETO_JWT_WORKSPACE` environment variable. For consumer scope, defaults
  to `"app"` (env var ignored) since all consumers live under that workspace.
  Pass an explicit value only if you need to override (e.g. staging tests).
- `privateKey` (string, optional): The private key used to sign the JWT.
  Defaults to the NEETO_JWT_PRIVATE_KEY environment variable.
- `scope` (string, optional): `"user"` (default) or `"consumer"`. Determines
  whether the generated URL targets `/users/auth/jwt` or `/consumers/auth/jwt`,
  and whether NeetoAuth requires the email to already exist (`user`) or
  auto-creates it on first sight (`consumer`).

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
