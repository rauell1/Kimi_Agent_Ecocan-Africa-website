import bcrypt from "bcryptjs";

export type AppRole = "admin" | "coordinator" | "field_officer" | "viewer";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hasAnyRole(userRole: string, roles: AppRole[]): boolean {
  return roles.includes(userRole as AppRole);
}
