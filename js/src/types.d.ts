import { SCOPES, SCOPE_ALIASES } from "./constants.js";

type ValueOf<T> = T[keyof T];

export type CanonicalScope = ValueOf<typeof SCOPES>;
export type ScopeAlias = keyof typeof SCOPE_ALIASES;
export type Scope = CanonicalScope | ScopeAlias;
