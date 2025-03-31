import jwt from "jsonwebtoken";
import { getLoginUri, getRedirectUri, SearchParams } from "./utils.js";

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

  generateLoginUrl = (product?: string) => {
    const searchParams: SearchParams = {
      jwt: this.generateJWT(),
    };

    if (product) {
      searchParams.redirect_uri = getRedirectUri(this.workspace, product);
    }

    return getLoginUri(this.workspace, searchParams);
  };
}

export default NeetoJWT;
