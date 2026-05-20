import jwt from "jsonwebtoken";
import { SCOPES, SCOPE_ALIASES } from "./constants.js";
import type { CanonicalScope, Scope } from "./types.js";
import {
  getClientAppName,
  getLoginUri,
  getRedirectUri,
  SearchParams,
} from "./utils.js";

interface Options {
  email: string;
  workspace?: string;
  privateKey?: string;
  scope?: Scope;
}

const ACCEPTED_SCOPES: readonly Scope[] = [
  ...Object.values(SCOPES),
  ...(Object.keys(SCOPE_ALIASES) as Array<keyof typeof SCOPE_ALIASES>),
];

const normalizeScope = (scope: Scope): CanonicalScope => {
  if ((Object.values(SCOPES) as string[]).includes(scope)) {
    return scope as CanonicalScope;
  }
  return SCOPE_ALIASES[scope as keyof typeof SCOPE_ALIASES];
};

class NeetoJWT {
  private email: string;
  private workspace: string;
  private privateKey: string;
  private scope: CanonicalScope;

  constructor(
    {
      email,
      scope = SCOPES.user,
      workspace = process.env.NEETO_JWT_WORKSPACE,
      privateKey = process.env.NEETO_JWT_PRIVATE_KEY,
    }: Options = {} as Options
  ) {
    if (!email) throw new Error("Email is required.");
    if (!workspace) throw new Error("Workspace is required.");
    if (!privateKey) throw new Error("Private key is required.");
    if (!ACCEPTED_SCOPES.includes(scope)) {
      throw new Error(`Scope must be one of: ${ACCEPTED_SCOPES.join(", ")}`);
    }

    this.email = email;
    this.workspace = workspace;
    this.privateKey = privateKey;
    this.scope = normalizeScope(scope);
  }

  generateJWT = () => {
    const iat = Math.floor(Date.now() / 1000); // Current date in seconds.
    const exp = iat + 2 * 60; // Expiry 2 minutes from now.

    const payload = {
      email: this.email,
      workspace: this.workspace,
      scope: this.scope,
      iat,
      exp,
    };

    try {
      const token = jwt.sign(payload, this.privateKey, { algorithm: "ES256" });
      return token;
    } catch {
      throw new Error(
        `Your key is invalid. We use asymmetric encryption for SSO login.\nPlease fill out https://neeto-jwt.neetodesk.com/forms/jwt-login-in-neeto.\nWe will generate a public-private key pair and share the private key with you. This key will assist you with SSO login.`
      );
    }
  };

  generateLoginUrl = (redirectUri: string) => {
    if (!redirectUri) throw new Error("Redirect URI is required");

    // User scope assumes the redirectUri points at a Neeto sub-app, so the
    // shared NeetoAuth flow strips the leading subdomain. Consumer scope is
    // for arbitrary partner domains — pass the URI through verbatim and let
    // URLSearchParams handle encoding.
    const redirect_uri =
      this.scope === SCOPES.consumer
        ? redirectUri
        : getRedirectUri(redirectUri);

    const searchParams: SearchParams = {
      jwt: this.generateJWT(),
      redirect_uri,
      client_app_name: getClientAppName(redirectUri),
    };

    return getLoginUri(this.workspace, searchParams, this.scope);
  };
}

export default NeetoJWT;
