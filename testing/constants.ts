import { ProjectsResponse } from "app/apis/azul/hca-dcp/common/responses";
import {
  ATLAS_STATUS,
  PublicationInfo,
  PUBLICATION_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CellxGeneCollection } from "../app/utils/cellxgene-api";
import { CrossrefWork } from "../app/utils/crossref/crossref";
import { TestAtlas, TestSourceDataset } from "./entities";
import { makeTestProjectsResponse, makeTestUser } from "./utils";

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
  doi: "10.123/sd-draft-ok",
  id: "d2932506-0af5-4030-920c-07f6beeb817a",
  publication: {
    authors: [
      {
        name: "draft-ok-author",
        personalName: null,
      },
    ],
    hasPreprintDoi: null,
    journal: "draft-ok-journal",
    preprintOfDoi: null,
    publicationDate: "2024-04-09",
    title: "draft-ok-title",
  },
  publicationStatus: PUBLICATION_STATUS.OK,
};

export const SOURCE_DATASET_DRAFT_NO_CROSSREF: TestSourceDataset = {
  doi: "10.123/sd-draft-no-crossref",
  id: "ee67ddcb-e5d8-4240-a8ef-c945657c3321",
  publication: null,
  publicationStatus: PUBLICATION_STATUS.DOI_NOT_ON_CROSSREF,
};

export const SOURCE_DATASET_PUBLIC_NO_CROSSREF: TestSourceDataset = {
  doi: "10.123/sd-public-no-crossref",
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
  id: "823dcc68-340b-4a61-8883-c61dc4975ce3",
  integrationLead: null,
  network: "eye",
  shortName: "test-draft",
  sourceDatasets: [
    SOURCE_DATASET_DRAFT_OK.id,
    SOURCE_DATASET_DRAFT_NO_CROSSREF.id,
  ],
  status: ATLAS_STATUS.DRAFT,
  version: "1.2",
  wave: "1",
};

export const ATLAS_PUBLIC: TestAtlas = {
  id: "94f62ad0-99cb-4f01-a1cf-cce2d56a8850",
  integrationLead: null,
  network: "lung",
  shortName: "test-public",
  sourceDatasets: [SOURCE_DATASET_PUBLIC_NO_CROSSREF.id],
  status: ATLAS_STATUS.PUBLIC,
  version: "2.3",
  wave: "1",
};

export const ATLAS_WITH_IL: TestAtlas = {
  id: "798b563d-16ff-438a-8e15-77be05b1f8ec",
  integrationLead: {
    email: "baz@example.com",
    name: "Baz",
  },
  network: "heart",
  shortName: "test-with-il",
  sourceDatasets: [],
  status: ATLAS_STATUS.DRAFT,
  version: "2.0",
  wave: "3",
};

export const ATLAS_NONEXISTENT = {
  id: "aa992f01-39ea-4906-ac12-053552561187",
};

// Atlases initialized in the database before tests
export const INITIAL_TEST_ATLASES = [ATLAS_DRAFT, ATLAS_PUBLIC, ATLAS_WITH_IL];

export const DOI_NORMAL = "10.123/test";

export const DOI_NORMAL2 = "10.123/test2";

export const DOI_NONEXISTENT = "10.123/nonexistent";

export const DOI_PREPRINT_NO_JOURNAL = "10.123/preprint-no-journal";

export const DOI_UNSUPPORTED_TYPE = "10.123/unsupported-type";

export const PUBLICATION_NORMAL: PublicationInfo = {
  authors: [
    {
      name: "Foo",
      personalName: null,
    },
  ],
  hasPreprintDoi: null,
  journal: "Bar",
  preprintOfDoi: null,
  publicationDate: "2024-01-01",
  title: "A Test",
};

export const CROSSREF_WORK_NORMAL: CrossrefWork = {
  author: [{ family: "Foo" }],
  "container-title": ["Bar"],
  published: {
    "date-parts": [[2024, 1, 1]],
  },
  relation: {},
  "short-container-title": [],
  title: ["A Test"],
  type: "journal-article",
};

export const PUBLICATION_PREPRINT_NO_JOURNAL: PublicationInfo = {
  authors: [
    {
      name: "Bar",
      personalName: "Baz",
    },
  ],
  hasPreprintDoi: null,
  journal: "Preprint",
  preprintOfDoi: null,
  publicationDate: "2024-04-17",
  title: "Preprint No Journal",
};

export const CROSSREF_WORK_PREPRINT_NO_JOURNAL: CrossrefWork = {
  author: [{ family: "Bar", given: "Baz" }],
  "container-title": [],
  published: {
    "date-parts": [[2024, 4, 17]],
  },
  relation: {},
  "short-container-title": [],
  subtype: "preprint",
  title: ["Preprint No Journal"],
  type: "posted-content",
};

export const CROSSREF_WORK_UNSUPPORTED_TYPE: CrossrefWork = {
  author: [{ name: "Baz" }],
  "container-title": ["Foo"],
  published: {
    "date-parts": [[2024, 4, 16]],
  },
  relation: {},
  "short-container-title": [],
  title: ["Unsupported Type"],
  type: "unsupported-type",
};

export const TEST_DOI_CROSSREF_WORKS = new Map([
  [DOI_NORMAL, CROSSREF_WORK_NORMAL],
  [DOI_PREPRINT_NO_JOURNAL, CROSSREF_WORK_PREPRINT_NO_JOURNAL],
  [DOI_UNSUPPORTED_TYPE, CROSSREF_WORK_UNSUPPORTED_TYPE],
]);

export const HCA_ID_NORMAL = "hca-id-normal";

export const HCA_ID_NORMAL2 = "hca-id-normal2";

export const TEST_HCA_IDS_BY_DOI = new Map([[DOI_NORMAL, HCA_ID_NORMAL]]);

export const HCA_PROJECTS_RESPONSES_TEST1: ProjectsResponse[] = [
  makeTestProjectsResponse(HCA_ID_NORMAL, DOI_NORMAL),
];

export const HCA_PROJECTS_RESPONSES_TEST2: ProjectsResponse[] = [
  makeTestProjectsResponse(HCA_ID_NORMAL, DOI_NORMAL),
  makeTestProjectsResponse(HCA_ID_NORMAL2, DOI_NORMAL2),
];

export const HCA_CATALOG_TEST1 = "hca-catalog-test1";

export const HCA_CATALOG_TEST2 = "hca-catalog-test2";

export const TEST_HCA_CATALOGS: Record<string, ProjectsResponse[]> = {
  [HCA_CATALOG_TEST1]: HCA_PROJECTS_RESPONSES_TEST1,
  [HCA_CATALOG_TEST2]: HCA_PROJECTS_RESPONSES_TEST2,
};

export const CELLXGENE_ID_NORMAL = "cellxgene-collection-normal";

export const CELLXGENE_ID_NORMAL2 = "cellxgene-collection-normal2";

export const TEST_CELLXGENE_IDS_BY_DOI = new Map([
  [DOI_NORMAL, CELLXGENE_ID_NORMAL],
]);

export const TEST_CELLXGENE_COLLECTION_NORMAL: CellxGeneCollection = {
  collection_id: CELLXGENE_ID_NORMAL,
  doi: DOI_NORMAL,
};

export const TEST_CELLXGENE_COLLECTION_NORMAL2: CellxGeneCollection = {
  collection_id: CELLXGENE_ID_NORMAL2,
  doi: DOI_NORMAL2,
};

export const TEST_CELLXGENE_COLLECTIONS_A = [TEST_CELLXGENE_COLLECTION_NORMAL];

export const TEST_CELLXGENE_COLLECTIONS_B = [
  TEST_CELLXGENE_COLLECTION_NORMAL,
  TEST_CELLXGENE_COLLECTION_NORMAL2,
];
