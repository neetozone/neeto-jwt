// @types/jsonwebtoken does not have a proper default export,
// but we need to support `import jwt from "jsonwebtoken";`
declare module "jsonwebtoken" {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const jwt: any;
  export default jwt;
}
