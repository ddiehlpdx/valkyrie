import { db } from "~/db.server";

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id }, omit: { password: true } });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email }, omit: { password: true } });
}

export async function getUserByUsername(username: string) {
  return db.user.findUnique({ where: { username }, omit: { password: true } });
}

export async function signUp(email: string, username: string, password: string) {
  return db.user.signUp(email, username, password);
}

export async function signIn(emailOrUsername: string, password: string) {
  return db.user.signIn(emailOrUsername, password);
}
