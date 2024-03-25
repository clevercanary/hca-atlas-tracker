import { TestUser } from "./entities";

export function makeTestUser(nameId: string, role: string): TestUser {
  return {
    authorization: `Bearer ${nameId}`,
    email: `${nameId}@example.com`,
    name: nameId,
    role,
    token: nameId,
  };
}
