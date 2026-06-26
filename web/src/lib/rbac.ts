import { Role } from "@prisma/client";

export type RoleSet = Role | Role[];

const ROLE_RANK: Record<Role, number> = {
  [Role.cadet]:      0,
  [Role.moderator]:  1,
  [Role.instructor]: 2,
  [Role.command]:    3,
};

export function hasRole(userRole: Role, required: RoleSet): boolean {
  const roles = Array.isArray(required) ? required : [required];
  return roles.some((r) => ROLE_RANK[userRole] >= ROLE_RANK[r]);
}

export function requireRole(
  userRole: Role,
  required: RoleSet
): Response | null {
  if (!hasRole(userRole, required)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

// Shorthand guards — return a Response if denied, null if allowed.
export const requireCadet      = (r: Role) => requireRole(r, Role.cadet);
export const requireModerator  = (r: Role) => requireRole(r, Role.moderator);
export const requireInstructor = (r: Role) => requireRole(r, Role.instructor);
export const requireCommand    = (r: Role) => requireRole(r, Role.command);
