import { TestUser } from "./entities";

export function makeTestUser(
  nameId: string,
  role = "",
  disabled = false
): TestUser {
  return {
    authorization: `Bearer ${nameId}`,
    disabled,
    email: `${nameId}@example.com`,
    name: nameId,
    role,
    token: nameId,
  };
}
