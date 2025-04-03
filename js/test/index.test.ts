import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import NeetoJWT from "../src";
import { generateES256KeyPair } from "./utils";

const { privateKey, publicKey } = generateES256KeyPair();

describe("NeetoJWT", () => {
  const email = "oliver@example.com";
  const workspace = "spinkart";
  const redirectUri = "https://spinkart.neetocal.com/admin";

  it("should create a NeetoJWT instance", () => {
    const neetoJWT = new NeetoJWT({ email, workspace, privateKey });
    expect(neetoJWT).toBeDefined();
  });

  it("should throw an error if email is missing", () => {
    // @ts-expect-error: email is dropped intensionally.
    expect(() => new NeetoJWT({ workspace, privateKey })).toThrow(
      "Email is required."
    );
  });

  it("should throw an error if workspace is missing", () => {
    expect(() => new NeetoJWT({ email, privateKey })).toThrow(
      "Workspace is required."
    );
  });

  it("should throw an error if privateKey is missing", () => {
    expect(() => new NeetoJWT({ email, workspace })).toThrow(
      "Private key is required."
    );
  });

  it("should generate a JWT", () => {
    const neetoJWT = new NeetoJWT({ email, workspace, privateKey });
    const token = neetoJWT.generateJWT();
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] });
    expect(decoded.email).toBe(email);
    expect(decoded.workspace).toBe(workspace);
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  it("should generate a login URL", () => {
    const neetoJWT = new NeetoJWT({ email, workspace, privateKey });
    const loginUrl = neetoJWT.generateLoginUrl(redirectUri);
    expect(loginUrl).toBeDefined();
    expect(loginUrl).toContain("https://spinkart.neetoauth.com/users/auth/jwt");
    expect(loginUrl).toContain(`jwt=`);
    expect(loginUrl).toContain(
      `redirect_uri=${encodeURIComponent(redirectUri)}`
    );
    expect(loginUrl).toContain(`client_app_name=Cal`);
  });

  it("should throw an error if redirectUri is missing", () => {
    const neetoJWT = new NeetoJWT({ email, workspace, privateKey });
    // @ts-expect-error: redirect_uri is dropped intensionally.
    expect(() => neetoJWT.generateLoginUrl()).toThrow(
      "Redirect URI is required"
    );
  });

  it("should use environment variables for workspace and privateKey if not provided", () => {
    process.env.NEETO_JWT_WORKSPACE = "spinkart";
    process.env.NEETO_JWT_PRIVATE_KEY = privateKey;

    const neetoJWT = new NeetoJWT({ email });
    const token = neetoJWT.generateJWT();
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["ES256"],
    });
    expect(decoded.workspace).toBe(process.env.NEETO_JWT_WORKSPACE);
  });
});
