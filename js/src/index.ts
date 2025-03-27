import jwt from "jsonwebtoken";

interface Options {
  email: string;
  issuer?: string;
  privateKey?: string;
  [key: string]: string | undefined;
}

class NeetoJWT {
  private email: string;
  private issuer: string;
  private privateKey: string;
  private otherOptions: Record<string, string | undefined>;

  constructor(options: Options) {
    const {
      email,
      issuer = process.env.NEETO_JWT_ISSUER,
      privateKey = process.env.NEETO_JWT_PRIVATE_KEY,
      ...otherOptions
    } = options || {};

    if (!email) throw new Error("Email is required.");
    if (!issuer) throw new Error("Issuer is required.");
    if (!privateKey) throw new Error("Private key is required.");

    this.email = email;
    this.issuer = issuer;
    this.privateKey = privateKey;
    this.otherOptions = otherOptions;
  }

  generate() {
    const iat = Math.floor(Date.now() / 1000); // Current date in seconds.
    const exp = iat + 2 * 60; // Expiry 2 minutes from now.

    const payload = {
      ...this.otherOptions,
      email: this.email,
      iss: this.issuer,
      iat,
      exp,
    };

    const token = jwt.sign(payload, this.privateKey, { algorithm: "ES256" });

    return token;
  }
}

export default NeetoJWT;
