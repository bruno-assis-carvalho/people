export interface AuthConfig {
  authToken?: string;
  authEmail: string;
  authPassword: string;
  auth0Domain?: string;
  auth0Audience?: string;
  auth0ClientId?: string;
  auth0ClientSecret?: string;
}

export const requireAuthConfiguration = (config: AuthConfig): void => {
  if (config.authToken) {
    return;
  }

  const missing = [
    ["AUTH0_DOMAIN", config.auth0Domain],
    ["AUTH0_AUDIENCE", config.auth0Audience],
    ["AUTH0_CLIENT_ID", config.auth0ClientId],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Set AUTH_TOKEN, or set ${missing.join(", ")} plus AUTH_EMAIL and AUTH_PASSWORD for password-grant authentication.`,
    );
  }
};
