import jwt from "jsonwebtoken";
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
}

class NeetoJWT {
  private email: string;
  private workspace: string;
  private privateKey: string;

  constructor(options: Options) {
    const {
      email,
      workspace = process.env.NEETO_JWT_WORKSPACE,
      privateKey = process.env.NEETO_JWT_PRIVATE_KEY,
    } = options || {};

    if (!email) throw new Error("Email is required.");
    if (!workspace) throw new Error("Workspace is required.");
    if (!privateKey) throw new Error("Private key is required.");

    this.email = email;
    this.workspace = workspace;
    this.privateKey = privateKey;
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

    const token = jwt.sign(payload, this.privateKey, { algorithm: "ES256" });
    return token;
  };

  generateLoginUrl = (redirectUri: string) => {
    if (!redirectUri) throw new Error("Redirect URI is required");

    const searchParams: SearchParams = {
      jwt: this.generateJWT(),
      redirect_uri: getRedirectUri(redirectUri),
      client_app_name: getClientAppName(redirectUri),
    };

    return getLoginUri(this.workspace, searchParams);
  };
}

export default NeetoJWT;
