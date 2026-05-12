import {
  CLIENT_APPS,
  CONSUMER_LOGIN_PATH,
  CONSUMER_AUTH_HOST,
  SCOPES,
  NEETO_URL_COMPONENT_REGEX,
  NEETO_URL_PREFIX_REGEX,
  TLD,
  USER_LOGIN_PATH,
} from "./constants.js";
import type { Scope } from "./types.js";

export type SearchParams = {
  jwt: string;
  redirect_uri: string;
  client_app_name: string;
};

export const getLoginUri = (
  workspace: string,
  searchParams: SearchParams,
  scope: Scope = SCOPES.user
) => {
  const protocol =
    process.env.NEETO_JWT_ENV === "development" ? "http" : "https";
  const params = new URLSearchParams(searchParams).toString();
  const isConsumer = scope === SCOPES.consumer;
  const host = isConsumer ? CONSUMER_AUTH_HOST : workspace;
  const path = isConsumer ? CONSUMER_LOGIN_PATH : USER_LOGIN_PATH;

  return `${protocol}://${host}${getTopLevelDomain()}${path}?${params}`;
};

export const getTopLevelDomain = () => {
  const env: string = process.env.NEETO_JWT_ENV || "production";
  return TLD[env] || ".com";
};

type App = keyof typeof CLIENT_APPS;
export const getClientAppName = (redirectUri: string) => {
  const app = redirectUri.match(NEETO_URL_COMPONENT_REGEX)?.[1];

  if (app && app in CLIENT_APPS) {
    return CLIENT_APPS[app as App];
  }

  return "Cal";
};

export const getRedirectUri = (redirectUri: string) => {
  const match = redirectUri.match(NEETO_URL_PREFIX_REGEX);

  if (match) {
    return encodeURI(redirectUri.replace(NEETO_URL_PREFIX_REGEX, ""));
  }

  return encodeURI(getTopLevelDomain());
};
