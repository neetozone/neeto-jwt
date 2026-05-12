import { SCOPES } from "./constants.js";

type ValueOf<T> = T[keyof T];

export type Scope = ValueOf<typeof SCOPES>;
