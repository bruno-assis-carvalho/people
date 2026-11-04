import type { JWTPayload } from "express-oauth2-jwt-bearer";
import { auth } from "express-oauth2-jwt-bearer";
import type {
  Action,
  AuthorizationChecker,
  CurrentUserChecker,
} from "routing-controllers";

export type AuthenticatedUser = JWTPayload & { sub: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const toStringList = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

export const createAuthMiddleware = () => {
  const configuredDomain = process.env.AUTH0_DOMAIN;
  const audience = process.env.AUTH0_AUDIENCE;
  if (!configuredDomain || !audience) {
    throw new Error("AUTH0_DOMAIN and AUTH0_AUDIENCE are required");
  }

  const issuerBaseURL = new URL(
    configuredDomain.includes("://")
      ? configuredDomain
      : `https://${configuredDomain}`,
  );
  if (issuerBaseURL.protocol !== "https:") {
    throw new Error("AUTH0_DOMAIN must use HTTPS");
  }

  return auth({
    issuerBaseURL: issuerBaseURL.toString(),
    audience,
    tokenSigningAlg: "RS256",
  });
};

export const authorizationChecker: AuthorizationChecker = async (
  action: Action,
  roles: string[],
) => {
  const payload = action.request.auth?.payload;
  if (!payload || typeof payload.sub !== "string") {
    return false;
  }

  const user = payload as AuthenticatedUser;
  action.request.user = user;
  if (roles.length === 0) {
    return true;
  }

  const roleClaim = process.env.AUTH0_ROLES_CLAIM || "roles";
  const roleValues = [
    ...toStringList(payload[roleClaim]),
    ...toStringList(payload.permissions),
  ];
  return roles.some((role) => roleValues.includes(role));
};

export const currentUserChecker: CurrentUserChecker = async (action: Action) =>
  action.request.user;
