import { TLD } from "./constants.js";

export type SearchParams = {
  jwt: string;
  redirect_uri?: string;
  state: string;
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
