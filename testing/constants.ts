import { makeTestUser } from "./utils";

export const USER_NORMAL = makeTestUser("test-normal", "");
export const USER_DISABLED = makeTestUser("test-disabled", "", true);
export const USER_CONTENT_ADMIN = makeTestUser(
  "test-content-admin",
  "CONTENT_ADMIN"
);

export const USER_NONEXISTENT = makeTestUser("test-nonexistant");
export const USER_NEW = makeTestUser("test-new");

// Users initialized in the database before tests
export const INITIAL_TEST_USERS = [
  USER_NORMAL,
  USER_DISABLED,
  USER_CONTENT_ADMIN,
];

export const TEST_USERS = [...INITIAL_TEST_USERS, USER_NONEXISTENT, USER_NEW];
