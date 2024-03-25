import { makeTestUser } from "./utils";

export const USER_NORMAL = makeTestUser("test-normal", "");
export const USER_CONTENT_ADMIN = makeTestUser(
  "test-content-admin",
  "CONTENT_ADMIN"
);

export const TEST_USERS = [USER_NORMAL, USER_CONTENT_ADMIN];

export const INITIAL_TEST_USERS = [USER_NORMAL, USER_CONTENT_ADMIN];
