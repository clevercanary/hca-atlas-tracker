import { ProjectsResponse } from "app/apis/azul/hca-dcp/common/responses";
import {
  ATLAS_STATUS,
  DOI_STATUS,
  PublicationInfo,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CellxGeneCollection } from "../app/utils/cellxgene-api";
import { CrossrefWork } from "../app/utils/crossref/crossref";
import {
  TestAtlas,
  TestPublishedSourceDataset,
  TestUnpublishedSourceDataset,
} from "./entities";
import { makeTestProjectsResponse, makeTestUser } from "./utils";

// USERS

export const USER_UNREGISTERED = makeTestUser("test-unregistered");
export const USER_STAKEHOLDER = makeTestUser(
  "test-stakeholder",
  ROLE.STAKEHOLDER
);
export const USER_DISABLED = makeTestUser(
  "test-disabled",
  ROLE.STAKEHOLDER,
  true
);
export const USER_CONTENT_ADMIN = makeTestUser(
  "test-content-admin",
  ROLE.CONTENT_ADMIN
);

export const USER_NONEXISTENT = makeTestUser("test-nonexistant");
export const USER_NEW = makeTestUser("test-new");

// Users initialized in the database before tests
export const INITIAL_TEST_USERS = [
  USER_DISABLED,
  USER_STAKEHOLDER,
  USER_CONTENT_ADMIN,
];

export const TEST_USERS = [
  ...INITIAL_TEST_USERS,
  USER_UNREGISTERED,
  USER_NONEXISTENT,
  USER_NEW,
];

// DOIS

export const DOI_NORMAL = "10.123/test";

export const DOI_NORMAL2 = "10.123/test2";

export const DOI_NONEXISTENT = "10.123/nonexistent";

export const DOI_PREPRINT_NO_JOURNAL = "10.123/preprint-no-journal";

export const DOI_UNSUPPORTED_TYPE = "10.123/unsupported-type";

export const DOI_PREPRINT_WITH_JOURNAL_COUNTERPART =
  "10.123/preprint-with-journal-counterpart";

export const DOI_JOURNAL_COUNTERPART = "10.123/journal-counterpart";

export const DOI_JOURNAL_WITH_PREPRINT_COUNTERPART =
  "10.123/journal-with-preprint-counterpart";

export const DOI_PREPRINT_COUNTERPART = "10.123/preprint-counterpart";

export const DOI_PUBLIC_WITH_PREPRINT = "10.123/public-with-preprint";

export const DOI_PUBLIC_WITH_PREPRINT_PREPRINT =
  "10.123/public-with-preprint-preprint";

export const DOI_PUBLIC_WITH_JOURNAL = "10.123/public-with-journal";

export const DOI_PUBLIC_WITH_JOURNAL_JOURNAL =
  "10.123/public-with-journal-journal";

export const DOI_DRAFT_OK = "10.123/sd-draft-ok";

export const DOI_PUBLISHED_WITH_HCA = "10.123/sd-published-with-hca";

export const DOI_PUBLISHED_WITH_HCA_TITLE_MISMATCH =
  "10.123/sd-published-with-hca-title-mismatch";

export const DOI_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA =
  "10.123/sd-published-with-no-hca-primary-data";

// PUBLICATIONS

export const PUBLICATION_DRAFT_OK: PublicationInfo = {
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
};

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

export const PUBLICATION_PREPRINT_WITH_JOURNAL_COUNTERPART: PublicationInfo = {
  authors: [
    {
      name: "Foobar",
      personalName: null,
    },
  ],
  hasPreprintDoi: null,
  journal: "Baz",
  preprintOfDoi: DOI_JOURNAL_COUNTERPART,
  publicationDate: "2024-04-21",
  title: "Preprint With Journal Counterpart",
};

export const CROSSREF_WORK_PREPRINT_WITH_JOURNAL_COUNTERPART: CrossrefWork = {
  author: [{ family: "Foobar" }],
  "container-title": [],
  institution: [{ name: "Baz" }],
  published: {
    "date-parts": [[2024, 4, 21]],
  },
  relation: {
    "is-preprint-of": [{ id: DOI_JOURNAL_COUNTERPART, "id-type": "doi" }],
  },
  "short-container-title": [],
  subtype: "preprint",
  title: ["Preprint With Journal Counterpart"],
  type: "posted-content",
};

export const PUBLICATION_JOURNAL_WITH_PREPRINT_COUNTERPART: PublicationInfo = {
  authors: [
    {
      name: "Foobaz",
      personalName: null,
    },
  ],
  hasPreprintDoi: DOI_PREPRINT_COUNTERPART,
  journal: "Bar",
  preprintOfDoi: null,
  publicationDate: "2024-04-22",
  title: "Journal With Preprint Counterpart",
};

export const CROSSREF_WORK_JOURNAL_WITH_PREPRINT_COUNTERPART: CrossrefWork = {
  author: [{ family: "Foobaz" }],
  "container-title": [],
  published: {
    "date-parts": [[2024, 4, 22]],
  },
  relation: {
    "has-preprint": [{ id: DOI_PREPRINT_COUNTERPART, "id-type": "doi" }],
  },
  "short-container-title": ["Bar"],
  title: ["Journal With Preprint Counterpart"],
  type: "journal-article",
};

export const PUBLICATION_PUBLIC_WITH_PREPRINT: PublicationInfo = {
  authors: [
    {
      name: "Bar Foo",
      personalName: null,
    },
  ],
  hasPreprintDoi: DOI_PUBLIC_WITH_PREPRINT_PREPRINT,
  journal: "Foo Bar",
  preprintOfDoi: null,
  publicationDate: "2024-04-29",
  title: "Public With Preprint",
};

export const PUBLICATION_PUBLIC_WITH_JOURNAL: PublicationInfo = {
  authors: [
    {
      name: "Bar Baz",
      personalName: null,
    },
  ],
  hasPreprintDoi: null,
  journal: "Baz Bar",
  preprintOfDoi: DOI_PUBLIC_WITH_JOURNAL_JOURNAL,
  publicationDate: "2024-04-30",
  title: "Public With Journal",
};

export const TEST_DOI_CROSSREF_WORKS = new Map([
  [DOI_NORMAL, CROSSREF_WORK_NORMAL],
  [DOI_PREPRINT_NO_JOURNAL, CROSSREF_WORK_PREPRINT_NO_JOURNAL],
  [DOI_UNSUPPORTED_TYPE, CROSSREF_WORK_UNSUPPORTED_TYPE],
  [
    DOI_PREPRINT_WITH_JOURNAL_COUNTERPART,
    CROSSREF_WORK_PREPRINT_WITH_JOURNAL_COUNTERPART,
  ],
  [
    DOI_JOURNAL_WITH_PREPRINT_COUNTERPART,
    CROSSREF_WORK_JOURNAL_WITH_PREPRINT_COUNTERPART,
  ],
]);

// HCA PROJECTS

export const HCA_ID_NORMAL = "hca-id-normal";

export const HCA_ID_NORMAL2 = "hca-id-normal2";

export const HCA_ID_JOURNAL_COUNTERPART = "hca-id-journal-counterpart";

export const HCA_ID_PREPRINT_COUNTERPART = "hca-id-preprint-counterpart";

export const HCA_ID_PUBLISHED_WITH_HCA = "hca-id-published-with-hca";

export const HCA_ID_PUBLISHED_WITH_HCA_TITLE_MISMATCH =
  "hca-id-published-with-hca-title-mismatch";

export const HCA_ID_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA =
  "hca-id-published-with-no-hca-primary-data";

export const HCA_PROJECTS_RESPONSE_NORMAL = makeTestProjectsResponse(
  HCA_ID_NORMAL,
  DOI_NORMAL,
  "A Test"
);

export const HCA_PROJECTS_RESPONSE_NORMAL2 = makeTestProjectsResponse(
  HCA_ID_NORMAL2,
  DOI_NORMAL2,
  "Foo Bar Baz"
);

export const HCA_PROJECTS_RESPONSE_JOURNAL_COUNTERPART =
  makeTestProjectsResponse(
    HCA_ID_JOURNAL_COUNTERPART,
    DOI_JOURNAL_COUNTERPART,
    "Journal Counterpart"
  );

export const HCA_PROJECTS_RESPONSE_PREPRINT_COUNTERPART =
  makeTestProjectsResponse(
    HCA_ID_PREPRINT_COUNTERPART,
    DOI_PREPRINT_COUNTERPART,
    "Preprint Counterpart"
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_HCA,
    DOI_PUBLISHED_WITH_HCA,
    "Published With HCA"
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_MISMATCH =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
    DOI_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
    "Published With HCA Title Mismatch MISMATCHED"
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    DOI_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    "Published With No HCA Primary Data",
    []
  );

export const TEST_HCA_PROJECTS_BY_DOI = new Map([
  [DOI_NORMAL, HCA_PROJECTS_RESPONSE_NORMAL],
  [DOI_JOURNAL_COUNTERPART, HCA_PROJECTS_RESPONSE_JOURNAL_COUNTERPART],
  [DOI_PREPRINT_COUNTERPART, HCA_PROJECTS_RESPONSE_PREPRINT_COUNTERPART],
  [DOI_PUBLISHED_WITH_HCA, HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA],
  [
    DOI_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
    HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  ],
  [
    DOI_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
  ],
]);

export const HCA_PROJECTS_RESPONSES_TEST1: ProjectsResponse[] = [
  HCA_PROJECTS_RESPONSE_NORMAL,
];

export const HCA_PROJECTS_RESPONSES_TEST2: ProjectsResponse[] = [
  HCA_PROJECTS_RESPONSE_NORMAL,
  HCA_PROJECTS_RESPONSE_NORMAL2,
];

export const HCA_CATALOG_TEST1 = "hca-catalog-test1";

export const HCA_CATALOG_TEST2 = "hca-catalog-test2";

export const TEST_HCA_CATALOGS: Record<string, ProjectsResponse[]> = {
  [HCA_CATALOG_TEST1]: HCA_PROJECTS_RESPONSES_TEST1,
  [HCA_CATALOG_TEST2]: HCA_PROJECTS_RESPONSES_TEST2,
};

// CELLXGENE COLLECTIONS

export const CELLXGENE_ID_NORMAL = "cellxgene-collection-normal";

export const CELLXGENE_ID_NORMAL2 = "cellxgene-collection-normal2";

export const CELLXGENE_ID_JOURNAL_COUNTERPART =
  "cellxgene-collection-journal-counterpart";

export const CELLXGENE_ID_PREPRINT_COUNTERPART =
  "cellxgene-collection-preprint-counterpart";

export const CELLXGENE_ID_UNPUBLISHED_WITH_CELLXGENE =
  "cellxgene-collection-published-with-cellxgene";

export const TEST_CELLXGENE_COLLECTION_NORMAL: CellxGeneCollection = {
  collection_id: CELLXGENE_ID_NORMAL,
  doi: DOI_NORMAL,
  name: "A Test",
};

export const TEST_CELLXGENE_COLLECTION_NORMAL2: CellxGeneCollection = {
  collection_id: CELLXGENE_ID_NORMAL2,
  doi: DOI_NORMAL2,
  name: "Foo Bar Baz",
};

export const TEST_CELLXGENE_COLLECTION_JOURNAL_COUNTERPART: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_JOURNAL_COUNTERPART,
    doi: DOI_JOURNAL_COUNTERPART,
    name: "Journal Counterpart",
  };

export const TEST_CELLXGENE_COLLECTION_PREPRINT_COUNTERPART: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_PREPRINT_COUNTERPART,
    doi: DOI_PREPRINT_COUNTERPART,
    name: "Preprint Counterpart",
  };

export const TEST_CELLXGENE_COLLECTIONS_BY_DOI = new Map([
  [DOI_NORMAL, TEST_CELLXGENE_COLLECTION_NORMAL],
  [DOI_JOURNAL_COUNTERPART, TEST_CELLXGENE_COLLECTION_JOURNAL_COUNTERPART],
  [DOI_PREPRINT_COUNTERPART, TEST_CELLXGENE_COLLECTION_PREPRINT_COUNTERPART],
]);

export const TEST_CELLXGENE_COLLECTIONS_A = [TEST_CELLXGENE_COLLECTION_NORMAL];

export const TEST_CELLXGENE_COLLECTIONS_B = [
  TEST_CELLXGENE_COLLECTION_NORMAL,
  TEST_CELLXGENE_COLLECTION_NORMAL2,
];

// SOURCE DATASETS

export const SOURCE_DATASET_DRAFT_OK: TestPublishedSourceDataset = {
  doi: DOI_DRAFT_OK,
  doiStatus: DOI_STATUS.OK,
  id: "d2932506-0af5-4030-920c-07f6beeb817a",
  publication: PUBLICATION_DRAFT_OK,
};

export const SOURCE_DATASET_DRAFT_NO_CROSSREF: TestPublishedSourceDataset = {
  doi: "10.123/sd-draft-no-crossref",
  doiStatus: DOI_STATUS.DOI_NOT_ON_CROSSREF,
  id: "ee67ddcb-e5d8-4240-a8ef-c945657c3321",
  publication: null,
};

export const SOURCE_DATASET_PUBLIC_NO_CROSSREF: TestPublishedSourceDataset = {
  doi: "10.123/sd-public-no-crossref",
  doiStatus: DOI_STATUS.DOI_NOT_ON_CROSSREF,
  id: "dae11387-d0c2-4160-8f2e-0be27a3a551a",
  publication: null,
};

export const SOURCE_DATASET_PUBLIC_WITH_PREPRINT: TestPublishedSourceDataset = {
  doi: DOI_PUBLIC_WITH_PREPRINT,
  doiStatus: DOI_STATUS.OK,
  id: "babb7839-cf33-4422-b90f-d9ad53d1133d",
  publication: PUBLICATION_PUBLIC_WITH_PREPRINT,
};

export const SOURCE_DATASET_PUBLIC_WITH_JOURNAL: TestPublishedSourceDataset = {
  doi: DOI_PUBLIC_WITH_JOURNAL,
  doiStatus: DOI_STATUS.OK,
  id: "815a5b58-ce6e-4578-9210-ffb383e6cf78",
  publication: PUBLICATION_PUBLIC_WITH_JOURNAL,
};

export const SOURCE_DATASET_SHARED: TestPublishedSourceDataset = {
  doi: "10.123/sd-shared",
  doiStatus: DOI_STATUS.DOI_NOT_ON_CROSSREF,
  id: "b5051dd0-a321-46e9-8728-4a7e1082b3e3",
  publication: null,
};

export const SOURCE_DATASET_PUBLISHED_WITH_HCA: TestPublishedSourceDataset = {
  doi: DOI_PUBLISHED_WITH_HCA,
  doiStatus: DOI_STATUS.OK,
  id: "a8a6a337-a4d2-46f6-85e5-d703cfc5f853",
  publication: {
    authors: [
      {
        name: "Foo Baz",
        personalName: "Bar",
      },
    ],
    hasPreprintDoi: null,
    journal: "Bar Baz Foo",
    preprintOfDoi: null,
    publicationDate: "2024-05-08",
    title: "Published With HCA",
  },
};

export const SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE: TestUnpublishedSourceDataset =
  {
    cellxgeneCollectionId: CELLXGENE_ID_UNPUBLISHED_WITH_CELLXGENE,
    hcaProjectId: null,
    id: "6d18889a-e4f8-4cb3-8311-f589f0543254",
    unpublishedInfo: {
      contactEmail: null,
      referenceAuthor: "Foo",
      title: "Unpublished With HCA",
    },
  };

export const SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH: TestPublishedSourceDataset =
  {
    doi: DOI_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
    doiStatus: DOI_STATUS.OK,
    id: "1e4c0c9c-f29e-4734-8958-7a4ed565530c",
    publication: {
      authors: [
        {
          name: "Baz Foo",
          personalName: "Baz",
        },
      ],
      hasPreprintDoi: null,
      journal: "Foo Baz Foo",
      preprintOfDoi: null,
      publicationDate: "2024-05-09",
      title: "Published With HCA Title Mismatch",
    },
  };

export const SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA: TestPublishedSourceDataset =
  {
    doi: DOI_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    doiStatus: DOI_STATUS.OK,
    id: "c28a9f6f-2da7-440d-b6d6-468134f446f6",
    publication: {
      authors: [
        {
          name: "Baz Foo Foo",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Foo Baz Foo Foo",
      preprintOfDoi: null,
      publicationDate: "2024-05-20",
      title: "Published With No HCA Primary Data",
    },
  };

export const SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE: TestPublishedSourceDataset =
  {
    doi: "10.123/sd-published-with-no-hca-or-cellxgene",
    doiStatus: DOI_STATUS.OK,
    id: "40a569a7-d4a2-4331-9599-5d95a7f09ad5",
    publication: {
      authors: [
        {
          name: "Bar Foo",
          personalName: "Bar",
        },
      ],
      hasPreprintDoi: null,
      journal: "Foo Bar Foo",
      preprintOfDoi: null,
      publicationDate: "2024-05-10",
      title: "Published With No HCA Or CELLxGENE",
    },
  };

// Source datasets initialized in the database before tests
export const INITIAL_TEST_SOURCE_DATASETS = [
  SOURCE_DATASET_DRAFT_OK,
  SOURCE_DATASET_DRAFT_NO_CROSSREF,
  SOURCE_DATASET_PUBLIC_NO_CROSSREF,
  SOURCE_DATASET_PUBLIC_WITH_PREPRINT,
  SOURCE_DATASET_PUBLIC_WITH_JOURNAL,
  SOURCE_DATASET_SHARED,
  SOURCE_DATASET_PUBLISHED_WITH_HCA,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE,
  SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
  SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE,
];

// ATLASES

export const ATLAS_DRAFT: TestAtlas = {
  id: "823dcc68-340b-4a61-8883-c61dc4975ce3",
  integrationLead: null,
  network: "eye",
  shortName: "test-draft",
  sourceDatasets: [
    SOURCE_DATASET_DRAFT_OK.id,
    SOURCE_DATASET_SHARED.id,
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
  sourceDatasets: [
    SOURCE_DATASET_PUBLIC_NO_CROSSREF.id,
    SOURCE_DATASET_SHARED.id,
  ],
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

export const ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A: TestAtlas = {
  id: "7ce0814d-606c-475b-942a-0f72ff8c5c0b",
  integrationLead: null,
  network: "organoid",
  shortName: "test-with-source-dataset-validations-a",
  sourceDatasets: [
    SOURCE_DATASET_PUBLISHED_WITH_HCA.id,
    SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE.id,
    SOURCE_DATASET_PUBLISHED_WITH_HCA_TITLE_MISMATCH.id,
    SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA.id,
  ],
  status: ATLAS_STATUS.DRAFT,
  version: "5.4",
  wave: "2",
};

export const ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B: TestAtlas = {
  id: "9766683a-3c8d-4ec8-b8b5-3fceb8fe0d31",
  integrationLead: null,
  network: "gut",
  shortName: "test-with-source-dataset-validations-b",
  sourceDatasets: [
    SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE.id,
    SOURCE_DATASET_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE.id,
  ],
  status: ATLAS_STATUS.DRAFT,
  version: "3.5",
  wave: "1",
};

export const ATLAS_NONEXISTENT = {
  id: "aa992f01-39ea-4906-ac12-053552561187",
};

// Atlases initialized in the database before tests
export const INITIAL_TEST_ATLASES = [
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_IL,
  ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_A,
  ATLAS_WITH_SOURCE_DATASET_VALIDATIONS_B,
];
