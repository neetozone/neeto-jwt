import jwt from "jsonwebtoken";

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

  generate() {
    const iat = Math.floor(Date.now() / 1000); // Current date in seconds.
    const exp = iat + 2 * 60; // Expiry 2 minutes from now.

    const payload = {
      email: this.email,
      iss: this.workspace,
      iat,
      exp,
    };

    const token = jwt.sign(payload, this.privateKey, { algorithm: "ES256" });

    return token;
  }
}

export default NeetoJWT;
