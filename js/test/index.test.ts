import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import NeetoJWT from "../src";
import { generateES256KeyPair } from "./utils";
import {
  CONSUMER_LOGIN_PATH,
  SCOPES,
  USER_LOGIN_PATH,
} from "../src/constants.js";

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
    expect(decoded.scope).toBe(SCOPES.user);
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  it("should embed scope in the JWT payload for consumer scope", () => {
    const neetoJWT = new NeetoJWT({
      email,
      workspace,
      privateKey,
      scope: SCOPES.consumer,
    });
    const token = neetoJWT.generateJWT();
    const decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] });
    expect(decoded.scope).toBe(SCOPES.consumer);
    expect(decoded.workspace).toBe(workspace);
  });

  it("should generate a login URL", () => {
    const neetoJWT = new NeetoJWT({ email, workspace, privateKey });
    const loginUrl = neetoJWT.generateLoginUrl(redirectUri);
    expect(loginUrl).toBeDefined();
    expect(loginUrl).toContain("https://spinkart.neetoauth.com/users/auth/jwt");
    expect(loginUrl).toContain(`jwt=`);
    expect(loginUrl).toContain(
      `redirect_uri=${encodeURIComponent("neetocal.com/admin")}`
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
    process.env.NEETO_JWT_WORKSPACE = workspace;
    process.env.NEETO_JWT_PRIVATE_KEY = privateKey;

    const neetoJWT = new NeetoJWT({ email });
    const token = neetoJWT.generateJWT();
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] });
    expect(decoded.workspace).toBe(process.env.NEETO_JWT_WORKSPACE);
  });

  it("should default to user scope and produce a /users/auth/jwt URL", () => {
    const neetoJWT = new NeetoJWT({ email, workspace, privateKey });
    const loginUrl = neetoJWT.generateLoginUrl(redirectUri);
    expect(loginUrl).toContain(USER_LOGIN_PATH);
    expect(loginUrl).not.toContain(CONSUMER_LOGIN_PATH);
  });

  it("should produce a /consumers/auth/jwt URL when scope is 'consumer'", () => {
    const neetoJWT = new NeetoJWT({
      email,
      workspace: "app",
      privateKey,
      scope: SCOPES.consumer,
    });
    const loginUrl = neetoJWT.generateLoginUrl(redirectUri);
    expect(loginUrl).toContain(CONSUMER_LOGIN_PATH);
    expect(loginUrl).not.toContain(USER_LOGIN_PATH);
    expect(loginUrl).toContain("https://app.neetoauth.com/consumers/auth/jwt");
  });

  it("should explicitly accept 'user' scope and produce the user URL", () => {
    const neetoJWT = new NeetoJWT({
      email,
      workspace,
      privateKey,
      scope: SCOPES.user,
    });
    const loginUrl = neetoJWT.generateLoginUrl(redirectUri);
    expect(loginUrl).toContain(USER_LOGIN_PATH);
  });

  it("should throw if scope is anything other than 'user' or 'consumer'", () => {
    expect(
      () =>
        new NeetoJWT({
          email,
          workspace,
          privateKey,
          // @ts-expect-error: invalid scope passed deliberately to assert runtime guard.
          scope: "admin",
        })
    ).toThrow(`Scope must be one of: ${Object.values(SCOPES).join(", ")}`);
  });

  it("should always use the global app auth host for consumer scope, even when workspace comes from NEETO_JWT_WORKSPACE", () => {
    const previous = process.env.NEETO_JWT_WORKSPACE;
    process.env.NEETO_JWT_WORKSPACE = "tenant1";
    try {
      const neetoJWT = new NeetoJWT({
        email,
        privateKey,
        scope: SCOPES.consumer,
      });
      const loginUrl = neetoJWT.generateLoginUrl(
        "http://partner.example.com/post-login"
      );
      expect(loginUrl).toContain(
        "https://app.neetoauth.com/consumers/auth/jwt"
      );

      const token = new URL(loginUrl).searchParams.get("jwt") as string;
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      expect(payload.workspace).toBe("tenant1");
    } finally {
      process.env.NEETO_JWT_WORKSPACE = previous;
    }
  });

  it("should throw when consumer scope is used without workspace or NEETO_JWT_WORKSPACE", () => {
    const previous = process.env.NEETO_JWT_WORKSPACE;
    delete process.env.NEETO_JWT_WORKSPACE;

    try {
      expect(
        () => new NeetoJWT({ email, privateKey, scope: SCOPES.consumer })
      ).toThrow("Workspace is required.");
    } finally {
      process.env.NEETO_JWT_WORKSPACE = previous;
    }
  });

  it("should send consumer scope to the global app host regardless of workspace override, while preserving the workspace claim", () => {
    const neetoJWT = new NeetoJWT({
      email,
      privateKey,
      workspace: "spinkart",
      scope: SCOPES.consumer,
    });
    const loginUrl = neetoJWT.generateLoginUrl("http://partner.example.com/cb");
    expect(loginUrl).toContain("https://app.neetoauth.com/consumers/auth/jwt");
    const token = new URL(loginUrl).searchParams.get("jwt") as string;
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    expect(payload.workspace).toBe("spinkart");
  });

  it("should not double-encode the consumer redirect URI", () => {
    const neetoJWT = new NeetoJWT({
      email,
      workspace: "app",
      privateKey,
      scope: SCOPES.consumer,
    });
    const loginUrl = neetoJWT.generateLoginUrl(
      "http://partner.example.com/path with space?q=1"
    );
    // URLSearchParams encodes a space as `+`, never as `%2520`.
    expect(loginUrl).not.toContain("%2520");
    const params = new URL(loginUrl).searchParams;
    expect(params.get("redirect_uri")).toBe(
      "http://partner.example.com/path with space?q=1"
    );
  });
});
