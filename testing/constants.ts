import { ATLAS_STATUS } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { TestAtlas } from "./entities";
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

export const ATLAS_DRAFT: TestAtlas = {
  focus: "test-draft",
  id: "823dcc68-340b-4a61-8883-c61dc4975ce3",
  network: "eye",
  status: ATLAS_STATUS.DRAFT,
  version: "1.2",
};

export const ATLAS_PUBLIC: TestAtlas = {
  focus: "test-public",
  id: "94f62ad0-99cb-4f01-a1cf-cce2d56a8850",
  network: "lung",
  status: ATLAS_STATUS.PUBLIC,
  version: "2.3",
};

export const ATLAS_NONEXISTENT = {
  id: "aa992f01-39ea-4906-ac12-053552561187",
};

// Atlases initialized in the database before tests
export const INITIAL_TEST_ATLASES = [ATLAS_DRAFT, ATLAS_PUBLIC];
