export const TLD: Record<string, string> = {
  staging: ".neetoauth.net",
  development: ".lvh.me:9000",
  production: ".neetoauth.com",
};

export const USER_LOGIN_PATH = "/users/auth/jwt";
export const CONSUMER_LOGIN_PATH = "/consumers/auth/jwt";
export const CONSUMER_AUTH_HOST = "app";

export const NEETO_URL_COMPONENT_REGEX = /neeto(\w+)/;
export const NEETO_URL_PREFIX_REGEX = /^(https?:\/\/)?(www\.)?[\w-]+\./;

export const CLIENT_APPS = {
  cal: "Cal",
  form: "Form",
  record: "Record",
  invoice: "Invoice",
  desk: "Desk",
  chat: "Chat",
  kb: "KB",
  site: "Site",
  runner: "Runner",
  wireframe: "Wireframe",
  engage: "Engage",
  quiz: "Quiz",
  replay: "Replay",
  planner: "Planner",
  crm: "CRM",
  publish: "Publish",
  course: "Course",
  testify: "Testify",
  code: "Code",
  git: "Git",
  ci: "CI",
  deploy: "Deploy",
  playdash: "Playdash",
  tower: "Tower",
};

export const SCOPES = {
  user: "user",
  consumer: "consumer",
} as const;
