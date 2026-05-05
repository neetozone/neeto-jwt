import jwt from "jsonwebtoken";
import { Scope } from "./types.js";
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

class NeetoJWT {
  private email: string;
  private workspace: string;
  private privateKey: string;
  private scope: Scope;

  constructor(options: Options) {
    const {
      email,
      workspace = process.env.NEETO_JWT_WORKSPACE,
      privateKey = process.env.NEETO_JWT_PRIVATE_KEY,
      scope = "user",
    } = options || {};

    if (!email) throw new Error("Email is required.");
    if (!workspace) throw new Error("Workspace is required.");
    if (!privateKey) throw new Error("Private key is required.");
    if (scope !== "user" && scope !== "consumer") {
      throw new Error("Scope must be either 'user' or 'consumer'.");
    }

    this.email = email;
    this.workspace = workspace;
    this.privateKey = privateKey;
    this.scope = scope;
  }

  generateJWT = () => {
    const iat = Math.floor(Date.now() / 1000); // Current date in seconds.
    const exp = iat + 2 * 60; // Expiry 2 minutes from now.

    const payload = {
      email: this.email,
      workspace: this.workspace,
      iat,
      exp,
    };

    try {
      const token = jwt.sign(payload, this.privateKey, { algorithm: "ES256" });
      return token;
    } catch (error) {
      throw new Error(
        `Your key is invalid. We use asymmetric encryption for SSO login.\nPlease fill out https://neeto-jwt.neetodesk.com/forms/jwt-login-in-neeto.\nWe will generate a public-private key pair and share the private key with you. This key will assist you with SSO login.`
      );
    }

    return null;
  };

  generateLoginUrl = (redirectUri: string) => {
    if (!redirectUri) throw new Error("Redirect URI is required");

    // User scope assumes the redirectUri points at a Neeto sub-app, so the
    // shared NeetoAuth flow strips the leading subdomain. Consumer scope is
    // for arbitrary partner domains — we pass the URI through verbatim so
    // NeetoAuth can redirect back to the partner correctly.
    const redirect_uri =
      this.scope === "consumer"
        ? encodeURI(redirectUri)
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
