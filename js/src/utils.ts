import {
  CLIENT_APPS,
  NEETO_URL_COMPONENT_REGEX,
  NEETO_URL_PREFIX_REGEX,
  TLD,
} from "./constants.js";

export type SearchParams = {
  jwt: string;
  redirect_uri: string;
  client_app_name: string;
};

export const getLoginUri = (workspace: string, searchParams: SearchParams) => {
  const protocol =
    process.env.NEETO_JWT_ENV === "development" ? "http" : "https";
  const params = new URLSearchParams(searchParams).toString();

  return `${protocol}://${workspace}${getTopLevelDomain()}/users/auth/jwt?${params}`;
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
