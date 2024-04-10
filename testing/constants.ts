import {
  ATLAS_STATUS,
  PublicationInfo,
  PUBLICATION_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { TestAtlas, TestSourceDataset } from "./entities";
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

export const SOURCE_DATASET_DRAFT_OK: TestSourceDataset = {
  doi: "test/sd-draft-ok",
  id: "d2932506-0af5-4030-920c-07f6beeb817a",
  publication: {
    authors: [
      {
        name: "draft-ok-author",
        personalName: null,
      },
    ],
    journal: "draft-ok-journal",
    publicationDate: "2024-04-09",
    title: "draft-ok-title",
  },
  publicationStatus: PUBLICATION_STATUS.OK,
};

export const SOURCE_DATASET_DRAFT_NO_CROSSREF: TestSourceDataset = {
  doi: "test/sd-draft-no-crossref",
  id: "ee67ddcb-e5d8-4240-a8ef-c945657c3321",
  publication: null,
  publicationStatus: PUBLICATION_STATUS.DOI_NOT_ON_CROSSREF,
};

export const SOURCE_DATASET_PUBLIC_NO_CROSSREF: TestSourceDataset = {
  doi: "test/sd-public-no-crossref",
  id: "dae11387-d0c2-4160-8f2e-0be27a3a551a",
  publication: null,
  publicationStatus: PUBLICATION_STATUS.DOI_NOT_ON_CROSSREF,
};

// Source datasets initialized in the database before tests
export const INITIAL_TEST_SOURCE_DATASETS = [
  SOURCE_DATASET_DRAFT_OK,
  SOURCE_DATASET_DRAFT_NO_CROSSREF,
  SOURCE_DATASET_PUBLIC_NO_CROSSREF,
];

export const ATLAS_DRAFT: TestAtlas = {
  focus: "test-draft",
  id: "823dcc68-340b-4a61-8883-c61dc4975ce3",
  network: "eye",
  sourceDatasets: [
    SOURCE_DATASET_DRAFT_OK.id,
    SOURCE_DATASET_DRAFT_NO_CROSSREF.id,
  ],
  status: ATLAS_STATUS.DRAFT,
  version: "1.2",
};

export const ATLAS_PUBLIC: TestAtlas = {
  focus: "test-public",
  id: "94f62ad0-99cb-4f01-a1cf-cce2d56a8850",
  network: "lung",
  sourceDatasets: [SOURCE_DATASET_PUBLIC_NO_CROSSREF.id],
  status: ATLAS_STATUS.PUBLIC,
  version: "2.3",
};

export const ATLAS_NONEXISTENT = {
  id: "aa992f01-39ea-4906-ac12-053552561187",
};

// Atlases initialized in the database before tests
export const INITIAL_TEST_ATLASES = [ATLAS_DRAFT, ATLAS_PUBLIC];

export const DOI_NORMAL = "test/test";

export const DOI_NONEXISTENT = "test/nonexistent";

export const PUBLICATION_NORMAL: PublicationInfo = {
  authors: [
    {
      name: "Foo",
      personalName: null,
    },
  ],
  journal: "Bar",
  publicationDate: "2024-01-01",
  title: "A Test",
};

export const TEST_DOI_PUBLICATIONS = new Map([
  [DOI_NORMAL, PUBLICATION_NORMAL],
]);
