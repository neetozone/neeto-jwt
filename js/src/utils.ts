import { NEETO_PRODUCTS, TLD } from "./constants.js";

const protocol = process.env.NEETO_JWT_ENV === "development" ? "http" : "https";

export const getRedirectUri = (workspace: string, product: string) => {
  const domain = product.toLowerCase().replace(/[-\s]/g, "");

  if (!NEETO_PRODUCTS.includes(domain)) {
    throw new Error(`${product} is not a valid Neeto product.`);
  }

  const redirectUri =
    `${protocol}://${workspace}${getTopLevelDomain()}/admin`.replace(
      "neetoauth",
      product
    );

  return encodeURI(redirectUri);
};

export type SearchParams = {
  jwt: string;
  redirect_uri?: string;
};

export const getLoginUri = (workspace: string, searchParams: SearchParams) => {
  const params = new URLSearchParams(searchParams).toString();
  return `${protocol}://${workspace}${getTopLevelDomain()}/users/auth/jwt?${params}`;
};

export const getTopLevelDomain = () => {
  const env: string = process.env.NEETO_JWT_ENV || "production";
  return TLD[env] || ".com";
};
