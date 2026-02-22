import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import {
  ATLAS_STATUS,
  DOI_STATUS,
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerDBComponentAtlasInfo,
  INTEGRITY_STATUS,
  PublicationInfo,
  REPROCESSED_STATUS,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CellxGeneCollection } from "../app/utils/cellxgene-api";
import { CrossrefWork } from "../app/utils/crossref/crossref";
import { EntrySheetValidationResponse } from "../app/utils/hca-validation-tools/hca-validation-tools";
import {
  TestAtlas,
  TestComment,
  TestComponentAtlas,
  TestConcept,
  TestEntrySheetValidation,
  TestFile,
  TestPublishedSourceStudy,
  TestSourceDataset,
  TestUnpublishedSourceStudy,
  TestUser,
} from "./entities";
import { makeTestProjectsResponse, makeTestUser } from "./utils";

export const TEST_S3_BUCKET = "test-bucket";

export const STAKEHOLDER_ANALOGOUS_ROLES = [
  ROLE.STAKEHOLDER,
  ROLE.INTEGRATION_LEAD,
  ROLE.CELLXGENE_ADMIN,
];

export const STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD =
  STAKEHOLDER_ANALOGOUS_ROLES.filter((r) => r !== ROLE.INTEGRATION_LEAD);

const ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_A =
  "test-with-source-study-validations-a";

const ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_C =
  "test-with-source-study-validations-c";

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

export const DOI_DRAFT_OK = "10.123/draft-ok";

export const DOI_PUBLISHED_WITH_HCA = "10.123/published-with-hca";

export const DOI_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO =
  "10.123/published-with-hca-bar";

export const DOI_PUBLISHED_WITH_HCA_TITLE_MISMATCH =
  "10.123/published-with-hca-title-mismatch";

export const DOI_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH =
  "10.123/published-with-hca-title-near-match";

export const DOI_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA =
  "10.123/published-with-no-hca-primary-data";

export const DOI_PUBLISHED_WITH_CAP_AND_CELLXGENE =
  "10.123/published-with-cap-and-cellxgene";

export const DOI_PUBLISHED_WITH_UNCHANGING_IDS =
  "10.123/published-with-unchanging-ids";

export const DOI_PUBLISHED_WITH_NEW_HCA_ID = "10.123/published-with-new-hca-id";

export const DOI_PUBLISHED_WITH_UPDATED_HCA_ID =
  "10.123/published-with-updated-hca-id";

export const DOI_PUBLISHED_WITH_REMOVED_HCA_ID =
  "10.123/published-with-removed-hca-id";

export const DOI_PUBLISHED_WITH_NEW_CELLXGENE_ID =
  "10.123/published-with-new-cellxgene-id";

export const DOI_PUBLISHED_WITH_UPDATED_CELLXGENE_ID =
  "10.123/published-with-updated-cellxgene-id";

export const DOI_PUBLISHED_WITH_REMOVED_CELLXGENE_ID =
  "10.123/published-with-removed-cellxgene-id";

export const DOI_PUBLISHED_WITH_CHANGING_IDS =
  "10.123/published-with-changing-ids";

export const DOI_WITH_NEW_SOURCE_DATASETS = "10.123/with-new-source-datasets";

export const DOI_WITH_ENTRY_SHEET_VALIDATIONS_BAR =
  "10.123/with-entry-sheet-validations-bar";

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

export const PUBLICATION_PUBLISHED_WITH_UNCHANGING_IDS: PublicationInfo = {
  authors: [
    {
      name: "Foo",
      personalName: null,
    },
  ],
  hasPreprintDoi: null,
  journal: "Journal Published With Unchanging IDs",
  preprintOfDoi: null,
  publicationDate: "2024-06-10",
  title: "Published With Unchanging IDs",
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

export const HCA_ID_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO =
  "hca-id-published-with-hca-bar";

export const HCA_ID_PUBLISHED_WITH_HCA_TITLE_MISMATCH =
  "hca-id-published-with-hca-title-mismatch";

export const HCA_ID_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH =
  "hca-id-published-with-hca-title-near-match";

export const HCA_ID_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA =
  "hca-id-published-with-no-hca-primary-data";

export const HCA_ID_PUBLISHED_WITH_UNCHANGING_IDS =
  "hca-id-published-with-unchanging-ids";

export const HCA_ID_PUBLISHED_WITH_NEW_HCA_ID =
  "hca-id-published-with-new-hca-id";

export const HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_A =
  "hca-id-published-with-updated-hca-id-a";

export const HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_B =
  "hca-id-published-with-updated-hca-id-b";

export const HCA_ID_PUBLISHED_WITH_REMOVED_HCA_ID =
  "hca-id-published-with-removed-hca-id";

export const HCA_ID_PUBLISHED_WITH_CHANGING_IDS =
  "hca-id-published-with-changing-ids";

export const HCA_PROJECTS_RESPONSE_NORMAL = makeTestProjectsResponse(
  HCA_ID_NORMAL,
  DOI_NORMAL,
  "A Test",
);

export const HCA_PROJECTS_RESPONSE_NORMAL2 = makeTestProjectsResponse(
  HCA_ID_NORMAL2,
  DOI_NORMAL2,
  "Foo Bar Baz",
);

export const HCA_PROJECTS_RESPONSE_JOURNAL_COUNTERPART =
  makeTestProjectsResponse(
    HCA_ID_JOURNAL_COUNTERPART,
    DOI_JOURNAL_COUNTERPART,
    "Journal Counterpart",
  );

export const HCA_PROJECTS_RESPONSE_PREPRINT_COUNTERPART =
  makeTestProjectsResponse(
    HCA_ID_PREPRINT_COUNTERPART,
    DOI_PREPRINT_COUNTERPART,
    "Preprint Counterpart",
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_HCA,
    DOI_PUBLISHED_WITH_HCA,
    "Published With HCA",
    undefined,
    [
      {
        shortName: ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_A,
        version: "v5.4",
      },
      { shortName: "test-with-il", version: "v2.0" },
    ],
    ["Organoid"],
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO,
    DOI_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO,
    "Published With HCA Unavailable Foo",
    undefined,
    [
      {
        shortName: ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_C,
        version: "v6.5",
      },
    ],
    ["Organoid"],
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_MISMATCH =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
    DOI_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
    "Published With HCA Title Mismatch MISMATCHED",
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
    DOI_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
    "Published – With     Hca Title <i>Near</i> Match. ",
    undefined,
    [
      {
        shortName: ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_A,
        version: "v5.4",
      },
    ],
    ["Organoid", "Heart"],
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    DOI_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    "Published With No HCA Primary Data",
    [],
    [
      {
        shortName: ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_A,
        version: "v5.4",
      },
    ],
    ["Organoid"],
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UNCHANGING_IDS =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_UNCHANGING_IDS,
    DOI_PUBLISHED_WITH_UNCHANGING_IDS,
    PUBLICATION_PUBLISHED_WITH_UNCHANGING_IDS.title,
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NEW_HCA_ID =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_NEW_HCA_ID,
    DOI_PUBLISHED_WITH_NEW_HCA_ID,
    "Published With New HCA ID",
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UPDATED_HCA_ID =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_B,
    DOI_PUBLISHED_WITH_UPDATED_HCA_ID,
    "Published With Updated HCA ID",
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_CHANGING_IDS =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_CHANGING_IDS,
    DOI_PUBLISHED_WITH_CHANGING_IDS,
    "Published With ",
  );

export const TEST_HCA_PROJECTS = [
  HCA_PROJECTS_RESPONSE_NORMAL,
  HCA_PROJECTS_RESPONSE_JOURNAL_COUNTERPART,
  HCA_PROJECTS_RESPONSE_PREPRINT_COUNTERPART,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UNCHANGING_IDS,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NEW_HCA_ID,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UPDATED_HCA_ID,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_CHANGING_IDS,
];

export const TEST_HCA_PROJECTS_WITH_UNAVAILABLE_SERVICE = [
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO,
];

export const TEST_HCA_PROJECTS_BY_DOI = new Map(
  TEST_HCA_PROJECTS.map((projectsResponse) => [
    projectsResponse.projects[0].publications[0].doi,
    projectsResponse,
  ]),
);

export const TEST_HCA_PROJECTS_BY_ID = new Map(
  TEST_HCA_PROJECTS.map((projectsResponse) => [
    projectsResponse.projects[0].projectId,
    projectsResponse,
  ]),
);

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

export const CELLXGENE_ID_PUBLISHED_WITH_CAP_AND_CELLXGENE =
  "cellxgene-collection-published-with-cap-and-cellxgene";

export const CELLXGENE_ID_WITH_SOURCE_DATASETS =
  "cellxgene-collection-with-source-datasets";

export const CELLXGENE_ID_PUBLISHED_WITH_UNCHANGING_IDS =
  "cellxgene-collection-with-unchanging-ids";

export const CELLXGENE_ID_PUBLISHED_WITH_NEW_CELLXGENE_ID =
  "cellxgene-collection-with-new-cellxgene-id";

export const CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_A =
  "cellxgene-collection-with-updated-cellxgene-id-a";

export const CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_B =
  "cellxgene-collection-with-updated-cellxgene-id-b";

export const CELLXGENE_ID_PUBLISHED_WITH_REMOVED_CELLXGENE_ID =
  "cellxgene-collection-with-removed-cellxgene-id";

export const CELLXGENE_ID_PUBLISHED_WITH_CHANGING_IDS =
  "cellxgene-collection-with-changing-ids";

export const CELLXGENE_ID_WITH_NEW_SOURCE_DATASETS =
  "cellxgene-collection-with-new-source-datasets";

export const CELLXGENE_ID_PUBLISHED_WITHOUT_CELLXGENE_ID =
  "cellxgene-collection-published-without-cellxgene-id";

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

export const TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_CAP_AND_CELLXGENE: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_PUBLISHED_WITH_CAP_AND_CELLXGENE,
    doi: DOI_PUBLISHED_WITH_CAP_AND_CELLXGENE,
    name: "Published With CAP And CELLxGENE",
  };

export const TEST_CELLXGENE_COLLECTION_WITH_SOURCE_DATASETS: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_WITH_SOURCE_DATASETS,
    doi: null,
    name: "With Source Datasets",
  };

export const TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_UNCHANGING_IDS: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_PUBLISHED_WITH_UNCHANGING_IDS,
    doi: DOI_PUBLISHED_WITH_UNCHANGING_IDS,
    name: PUBLICATION_PUBLISHED_WITH_UNCHANGING_IDS.title,
  };

export const TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_NEW_CELLXGENE_ID: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_PUBLISHED_WITH_NEW_CELLXGENE_ID,
    doi: DOI_PUBLISHED_WITH_NEW_CELLXGENE_ID,
    name: "Published With New CELLxGENE ID",
  };

export const TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_UPDATED_CELLXGENE_ID: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_B,
    doi: DOI_PUBLISHED_WITH_UPDATED_CELLXGENE_ID,
    name: "Published With Updated CELLxGENE ID",
  };

export const TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_CHANGING_IDS: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_PUBLISHED_WITH_CHANGING_IDS,
    doi: DOI_PUBLISHED_WITH_CHANGING_IDS,
    name: "Published With Changing IDs",
  };

export const TEST_CELLXGENE_COLLECTION_WITH_NEW_SOURCE_DATASETS: CellxGeneCollection =
  {
    collection_id: CELLXGENE_ID_WITH_NEW_SOURCE_DATASETS,
    doi: DOI_WITH_NEW_SOURCE_DATASETS,
    name: "With New Source Datasets",
  };

export const TEST_CELLXGENE_COLLECTIONS_BY_DOI = new Map([
  [DOI_NORMAL, TEST_CELLXGENE_COLLECTION_NORMAL],
  [DOI_JOURNAL_COUNTERPART, TEST_CELLXGENE_COLLECTION_JOURNAL_COUNTERPART],
  [DOI_PREPRINT_COUNTERPART, TEST_CELLXGENE_COLLECTION_PREPRINT_COUNTERPART],
  [
    DOI_PUBLISHED_WITH_CAP_AND_CELLXGENE,
    TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_CAP_AND_CELLXGENE,
  ],
  [
    DOI_PUBLISHED_WITH_UNCHANGING_IDS,
    TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_UNCHANGING_IDS,
  ],
  [
    DOI_PUBLISHED_WITH_NEW_CELLXGENE_ID,
    TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_NEW_CELLXGENE_ID,
  ],
  [
    DOI_PUBLISHED_WITH_UPDATED_CELLXGENE_ID,
    TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_UPDATED_CELLXGENE_ID,
  ],
  [
    DOI_PUBLISHED_WITH_CHANGING_IDS,
    TEST_CELLXGENE_COLLECTION_PUBLISHED_WITH_CHANGING_IDS,
  ],
  [
    DOI_WITH_NEW_SOURCE_DATASETS,
    TEST_CELLXGENE_COLLECTION_WITH_NEW_SOURCE_DATASETS,
  ],
]);

export const TEST_CELLXGENE_COLLECTIONS_BY_ID = new Map(
  Array.from(TEST_CELLXGENE_COLLECTIONS_BY_DOI.values(), (c) => [
    c.collection_id,
    { id: c.collection_id, title: c.name },
  ]),
);

export const TEST_CELLXGENE_COLLECTIONS_A = [TEST_CELLXGENE_COLLECTION_NORMAL];

export const TEST_CELLXGENE_COLLECTIONS_B = [
  TEST_CELLXGENE_COLLECTION_NORMAL,
  TEST_CELLXGENE_COLLECTION_NORMAL2,
];

// CELLXGENE DATASETS

export const CELLXGENE_ID_DATASET_WITHOUT_UPDATE =
  "cellxgene-dataset-without-update";

export const CELLXGENE_VERSION_DATASET_WITHOUT_UPDATE =
  "cellxgene-version-dataset-without-update";

export const CELLXGENE_ID_DATASET_WITH_UPDATE = "cellxgene-dataset-with-update";

export const CELLXGENE_ID_DATASET_NEW = "cellxgene-dataset-new";

export const CELLXGENE_ID_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO =
  "cellxgene-dataset-unpublished-with-cellxgene-foo";

export const CELLXGENE_VERSION_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO =
  "cellxgene-version-dataset-unpublished-with-cellxgene-foo";

export const CELLXGENE_ID_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR =
  "cellxgene-dataset-unpublished-with-cellxgene-bar";

export const CELLXGENE_VERSION_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR =
  "cellxgene-version-dataset-unpublished-with-cellxgene-bar";

export const CELLXGENE_ID_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO =
  "cellxgene-dataset-published-without-cellxgene-id-foo";

export const CELLXGENE_VERSION_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO =
  "cellxgene-version-dataset-published-without-cellxgene-id-foo";

// ENTRY SHEETS

export const ENTRY_SHEET_ID_DRAFT_OK_FOO =
  "1WYVCCPyldD5H4XPWoo54DWuJpCxZBkT8dsQAUm70YAU";
export const ENTRY_SHEET_TITLE_DRAFT_OK_FOO = "Entry Sheet Draft OK Foo";

export const ENTRY_SHEET_ID_DRAFT_OK_BAR =
  "1WT0EHqvxtnWfE2Bc5we6FJ9tx01pk5D19YXPJX1ZBMk";
export const ENTRY_SHEET_TITLE_DRAFT_OK_BAR = "Entry Sheet Draft OK Bar";

export const ENTRY_SHEET_ID_WITH_UPDATE =
  "1josZ23Q9x8tKRNk4yub5pJ66wEY2Sphf-WoOPDdm-JZ";

export const ENTRY_SHEET_ID_WITH_FAILED_UPDATE =
  "1Aip1fZ_27k93JKh5lSncYC2q7tu5sLegWca_RHrKbN1";

export const ENTRY_SHEET_ID_WITH_ERRORED_UPDATE =
  "1sxNF0nt04DFvQkP3-OCMRivLtmL73IfdAhgBVg901y9";

export const ENTRY_SHEET_ID_NEW =
  "15Nm4W5_k-e1o85KXqZAod1XwrIw7Rjmp87hbShGQ9-d";

export const ENTRY_SHEET_ID_NO_SYNC =
  "13BcErSq1NqvwFZp_DzKZ9aK0hK3D73Z3JuIoyTK4WPQ";

export const ENTRY_SHEET_ID_NEW_NON_SHARED =
  "1cCXtjK2SKkDsSiV0FmfY9FBaPLIaD6WlytLoggm3FNi";

export const ENTRY_SHEET_ID_WITH_MALFORMED_RESPONSE =
  "1OesrppsmDCTR-SeGs1gn6fIcbX6OjG5OsbOrT7Rh5dj";

export const ENTRY_SHEET_ID_NO_STUDY =
  "12yIrZ_ZRpPMJgNa0BmoyQEJZTTO3QUxvDiMtcqHal-o";

export const ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE = {
  errors: [
    {
      cell: "C7",
      column: "consortia",
      entity_type: "dataset",
      input: "foofoo",
      message: "error foofoo",
      primary_key: "dataset_id:dataset_foo_foo",
      row: 6,
      worksheet_id: 234203429,
    },
    {
      cell: "B11",
      column: "donor_id",
      entity_type: "sample",
      input: "foobar",
      message: "error foobar",
      primary_key: "sample_id:sample_foo_bar",
      row: 10,
      worksheet_id: 534298734234,
    },
  ],
  last_updated: {
    by: "foo",
    by_email: "foo@example.com",
    date: "2025-06-13T21:11:26.090Z",
  },
  sheet_title: "Entry Sheet With Update Updated",
  summary: {
    dataset_count: 3,
    donor_count: 9,
    error_count: 2,
    sample_count: 12,
  },
} satisfies EntrySheetValidationResponse;

export const ENTRY_SHEET_VALIDATION_RESPONSE_WITH_FAILED_UPDATE = {
  error: "Validation Response With Failed Update Error",
} satisfies EntrySheetValidationResponse;

export const ENTRY_SHEET_VALIDATION_RESPONSE_NEW = {
  errors: [
    {
      cell: "E12",
      column: "sex_ontology_term",
      entity_type: "donor",
      input: "foobaz",
      message: "error foobaz",
      primary_key: "donor_id:dataset_foo_baz",
      row: 11,
      worksheet_id: 234293752,
    },
  ],
  last_updated: {
    by: "bar",
    by_email: "bar@example.com",
    date: "2025-06-15T01:37:13.784Z",
  },
  sheet_title: "Entry Sheet New",
  summary: {
    dataset_count: 4,
    donor_count: 13,
    error_count: 1,
    sample_count: 21,
  },
} satisfies EntrySheetValidationResponse;

export const ENTRY_SHEET_VALIDATION_RESPONSE_NEW_NON_SHARED = {
  errors: [],
  last_updated: {
    by: "foobar",
    by_email: "foobar@example.com",
    date: "2025-06-15T20:59:56.670Z",
  },
  sheet_title: "Entry Sheet New Non Shared",
  summary: {
    dataset_count: 2,
    donor_count: 5,
    error_count: 0,
    sample_count: 12,
  },
} satisfies EntrySheetValidationResponse;

export const ENTRY_SHEET_VALIDATION_RESPONSE_MALFORMED = {
  errors: [],
  last_updated: {
    by: "foobaz",
    by_email: "foobaz@example.com",
    date: "2025-06-24T03:40:50.763Z",
  },
  sheet_title: "Entry Sheet With Malformed Response",
  summary: {
    donor_count: 7,
    error_count: 0,
    sample_count: 10,
  },
};

export const ENTRY_SHEET_VALIDATION_RESPONSE_NO_STUDY = {
  errors: [],
  last_updated: {
    by: "barfoo",
    by_email: "barfoo@example.com",
    date: "2025-07-19T06:35:15.565Z",
  },
  sheet_title: "Entry Sheet No Study",
  summary: {
    dataset_count: 3,
    donor_count: 14,
    error_count: 0,
    sample_count: 19,
  },
} satisfies EntrySheetValidationResponse;

export const TEST_ENTRY_SHEET_VALIDATION_RESPONSES_BY_ID = new Map<
  string,
  unknown
>([
  [ENTRY_SHEET_ID_WITH_UPDATE, ENTRY_SHEET_VALIDATION_RESPONSE_WITH_UPDATE],
  [
    ENTRY_SHEET_ID_WITH_FAILED_UPDATE,
    ENTRY_SHEET_VALIDATION_RESPONSE_WITH_FAILED_UPDATE,
  ],
  [ENTRY_SHEET_ID_NEW, ENTRY_SHEET_VALIDATION_RESPONSE_NEW],
  [
    ENTRY_SHEET_ID_NEW_NON_SHARED,
    ENTRY_SHEET_VALIDATION_RESPONSE_NEW_NON_SHARED,
  ],
  [
    ENTRY_SHEET_ID_WITH_MALFORMED_RESPONSE,
    ENTRY_SHEET_VALIDATION_RESPONSE_MALFORMED,
  ],
  [ENTRY_SHEET_ID_NO_STUDY, ENTRY_SHEET_VALIDATION_RESPONSE_NO_STUDY],
]);

export const TEST_ENTRY_SHEET_VALIDATION_FETCH_ERROR_MESSAGE =
  "Test entry sheet validation fetch error";

export const FETCH_ERROR_ENTRY_SHEET_IDS = new Set([
  ENTRY_SHEET_ID_WITH_ERRORED_UPDATE,
]);

// SOURCE STUDIES

export const SOURCE_STUDY_DRAFT_OK: TestPublishedSourceStudy = {
  doi: DOI_DRAFT_OK,
  doiStatus: DOI_STATUS.OK,
  id: "d2932506-0af5-4030-920c-07f6beeb817a",
  metadataSpreadsheets: [
    {
      id: ENTRY_SHEET_ID_DRAFT_OK_FOO,
      title: ENTRY_SHEET_TITLE_DRAFT_OK_FOO,
    },
    {
      id: ENTRY_SHEET_ID_DRAFT_OK_BAR,
      title: ENTRY_SHEET_TITLE_DRAFT_OK_BAR,
    },
  ],
  publication: PUBLICATION_DRAFT_OK,
};

export const SOURCE_STUDY_DRAFT_NO_CROSSREF: TestPublishedSourceStudy = {
  doi: "10.123/draft-no-crossref",
  doiStatus: DOI_STATUS.DOI_NOT_ON_CROSSREF,
  id: "ee67ddcb-e5d8-4240-a8ef-c945657c3321",
  publication: null,
};

export const SOURCE_STUDY_PUBLIC_NO_CROSSREF: TestPublishedSourceStudy = {
  doi: "10.123/public-no-crossref",
  doiStatus: DOI_STATUS.DOI_NOT_ON_CROSSREF,
  id: "dae11387-d0c2-4160-8f2e-0be27a3a551a",
  publication: null,
};

export const SOURCE_STUDY_PUBLIC_WITH_PREPRINT: TestPublishedSourceStudy = {
  doi: DOI_PUBLIC_WITH_PREPRINT,
  doiStatus: DOI_STATUS.OK,
  id: "babb7839-cf33-4422-b90f-d9ad53d1133d",
  publication: PUBLICATION_PUBLIC_WITH_PREPRINT,
};

export const SOURCE_STUDY_PUBLIC_WITH_JOURNAL: TestPublishedSourceStudy = {
  doi: DOI_PUBLIC_WITH_JOURNAL,
  doiStatus: DOI_STATUS.OK,
  id: "815a5b58-ce6e-4578-9210-ffb383e6cf78",
  publication: PUBLICATION_PUBLIC_WITH_JOURNAL,
};

export const SOURCE_STUDY_SHARED: TestPublishedSourceStudy = {
  doi: "10.123/shared",
  doiStatus: DOI_STATUS.DOI_NOT_ON_CROSSREF,
  id: "b5051dd0-a321-46e9-8728-4a7e1082b3e3",
  publication: null,
};

export const SOURCE_STUDY_PUBLISHED_WITH_HCA: TestPublishedSourceStudy = {
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

export const SOURCE_STUDY_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO: TestPublishedSourceStudy =
  {
    doi: DOI_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO,
    doiStatus: DOI_STATUS.OK,
    id: "3f411b2a-659f-41ce-8636-dd40306ae2f9",
    publication: {
      authors: [
        {
          name: "Foobazfoo",
          personalName: "Barbar",
        },
      ],
      hasPreprintDoi: null,
      journal: "Foo Barbar Bazfoo",
      preprintOfDoi: null,
      publicationDate: "2025-10-21",
      title: "Published With HCA Unavailable Foo",
    },
  };

export const SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: CELLXGENE_ID_UNPUBLISHED_WITH_CELLXGENE,
    hcaProjectId: null,
    id: "6d18889a-e4f8-4cb3-8311-f589f0543254",
    unpublishedInfo: {
      contactEmail: null,
      referenceAuthor: "Foo",
      title: "Unpublished With CELLxGENE",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_MISMATCH: TestPublishedSourceStudy =
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

export const SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH: TestPublishedSourceStudy =
  {
    doi: DOI_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
    doiStatus: DOI_STATUS.OK,
    id: "351ab5d7-99e9-473d-bb07-397abd01a2f2",
    publication: {
      authors: [
        {
          name: "Bar Baz Foo",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Foo Bar Foo",
      preprintOfDoi: null,
      publicationDate: "2024-05-22",
      title: "Published With HCA Title Near Match",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA: TestPublishedSourceStudy =
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

export const SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE: TestPublishedSourceStudy =
  {
    doi: "10.123/published-with-no-hca-or-cellxgene",
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

export const SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE: TestPublishedSourceStudy =
  {
    capId: "https://celltype.info/project/741640",
    doi: "10.123/published-with-cap-and-no-cellxgene",
    doiStatus: DOI_STATUS.OK,
    id: "0461d2ee-e41c-4f91-97a2-fcb0cb62d6d9",
    publication: {
      authors: [
        {
          name: "Baz",
          personalName: "Bar B.",
        },
      ],
      hasPreprintDoi: null,
      journal: "Foo Foo Foo",
      preprintOfDoi: null,
      publicationDate: "2024-06-01",
      title: "Published With CAP And No CELLxGENE",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE: TestPublishedSourceStudy =
  {
    capId: "https://celltype.info/project/718611",
    doi: DOI_PUBLISHED_WITH_CAP_AND_CELLXGENE,
    doiStatus: DOI_STATUS.OK,
    id: "17b397df-6443-4c02-9c78-b2ab9ba86052",
    publication: {
      authors: [
        {
          name: "Foo Foo",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Baz Baz Bar",
      preprintOfDoi: null,
      publicationDate: "2024-06-02",
      title: "Published With CAP And CELLxGENE",
    },
  };

export const SOURCE_STUDY_WITH_SOURCE_DATASETS: TestUnpublishedSourceStudy = {
  cellxgeneCollectionId: CELLXGENE_ID_WITH_SOURCE_DATASETS,
  hcaProjectId: null,
  id: "aa6a5a69-7d68-4dc1-b5ac-7ef0d55fc125",
  unpublishedInfo: {
    contactEmail: "bazfoo@example.com",
    referenceAuthor: "Baz Foo",
    title: "Source Study With Source Datasets",
  },
};

export const SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: CELLXGENE_ID_PUBLISHED_WITH_UNCHANGING_IDS,
    doi: DOI_PUBLISHED_WITH_UNCHANGING_IDS,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: HCA_ID_PUBLISHED_WITH_UNCHANGING_IDS,
    id: "c84db1e2-56ec-4e83-956a-ad41c96e1dfb",
    publication: PUBLICATION_PUBLISHED_WITH_UNCHANGING_IDS,
  };

export const SOURCE_STUDY_PUBLISHED_WITH_NEW_HCA_ID: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    doi: DOI_PUBLISHED_WITH_NEW_HCA_ID,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: null,
    id: "832731ec-e9cb-460e-9ba6-850ea62f99da",
    publication: {
      authors: [
        {
          name: "Bar",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Journal Published With New HCA ID",
      preprintOfDoi: null,
      publicationDate: "2024-06-11",
      title: "Published With New HCA ID",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_UPDATED_HCA_ID: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    doi: DOI_PUBLISHED_WITH_UPDATED_HCA_ID,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_A,
    id: "9fbc732f-a7da-4e91-b7c3-686d9e3e236a",
    publication: {
      authors: [
        {
          name: "Baz",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Journal Published With Updating HCA ID",
      preprintOfDoi: null,
      publicationDate: "2024-06-12",
      title: "Published With Updating HCA ID",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_REMOVED_HCA_ID: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    doi: DOI_PUBLISHED_WITH_REMOVED_HCA_ID,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: HCA_ID_PUBLISHED_WITH_REMOVED_HCA_ID,
    id: "1105c6fa-fa22-4eaf-907d-b4f82c686af8",
    publication: {
      authors: [
        {
          name: "Foofoo",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Journal Published With Removed HCA ID",
      preprintOfDoi: null,
      publicationDate: "2024-06-13",
      title: "Published With Removed HCA ID",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_NEW_CELLXGENE_ID: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    doi: DOI_PUBLISHED_WITH_NEW_CELLXGENE_ID,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: null,
    id: "80aa64d7-175a-4432-b04d-42c1a5f6c799",
    publication: {
      authors: [
        {
          name: "Foobar",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Journal Published With New CELLxGENE ID",
      preprintOfDoi: null,
      publicationDate: "2024-06-14",
      title: "Published With New CELLxGENE ID",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_UPDATED_CELLXGENE_ID: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_A,
    doi: DOI_PUBLISHED_WITH_UPDATED_CELLXGENE_ID,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: null,
    id: "f2ada434-6504-47d7-97cf-cd524c2293d2",
    publication: {
      authors: [
        {
          name: "Foobaz",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Journal Published With Updating CELLxGENE ID",
      preprintOfDoi: null,
      publicationDate: "2024-06-15",
      title: "Published With Updating CELLxGENE ID",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_REMOVED_CELLXGENE_ID: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: CELLXGENE_ID_PUBLISHED_WITH_REMOVED_CELLXGENE_ID,
    doi: DOI_PUBLISHED_WITH_REMOVED_CELLXGENE_ID,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: null,
    id: "fc836ee5-5474-4520-b7b9-3dd8c1224bd7",
    publication: {
      authors: [
        {
          name: "Barfoo",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Journal Published With Removed CELLxGENE ID",
      preprintOfDoi: null,
      publicationDate: "2024-06-16",
      title: "Published With Removed CELLxGENE ID",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITH_CHANGING_IDS: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    doi: DOI_PUBLISHED_WITH_CHANGING_IDS,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: null,
    id: "468fc429-cbe1-4626-ae8a-daef4bafa993",
    publication: {
      authors: [
        {
          name: "Barbar",
          personalName: null,
        },
      ],
      hasPreprintDoi: null,
      journal: "Journal Published With Changing IDs",
      preprintOfDoi: null,
      publicationDate: "2024-06-17",
      title: "Published With Changing IDs",
    },
  };

export const SOURCE_STUDY_UNPUBLISHED_WITH_HCA: TestUnpublishedSourceStudy = {
  cellxgeneCollectionId: null,
  hcaProjectId: "hca-id-unpublished-with-hca",
  id: "94b106b8-ff57-4e73-8e29-2a86a6e7f2fe",
  unpublishedInfo: {
    contactEmail: "barbaz@example.com",
    referenceAuthor: "Barbaz",
    title: "Unpublished With HCA",
  },
};

export const SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    hcaProjectId: null,
    id: "3e57fb9a-b2c0-4f5d-9109-62fe18c16891",
    unpublishedInfo: {
      contactEmail: "bazfoobar@example.com",
      referenceAuthor: "Baz Foo Bar",
      title: "Source Study With Other Source Datasets",
    },
  };

export const SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    doi: "10.123/published-without-cellxgene-id",
    doiStatus: DOI_STATUS.DOI_NOT_ON_CROSSREF,
    id: "d593d79b-ce3e-42fd-a5e0-c8052f3acabd",
    publication: null,
  };

export const SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    hcaProjectId: null,
    id: "626a8685-719b-4a72-9a71-642d6ab8c3be",
    unpublishedInfo: {
      contactEmail: "barbazfoobazfoo@example.com",
      referenceAuthor: "Bar Foo Foo Baz Baz",
      title: "Source Study With Atlas Linked Datasets A",
    },
  };

export const SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    hcaProjectId: null,
    id: "7a2fb8ae-a9a7-4e61-b36e-80097d121b0a",
    unpublishedInfo: {
      contactEmail: "foofoobazbazfoo@example.com",
      referenceAuthor: "Bar Foo Bar Baz Bar",
      title: "Source Study With Atlas Linked Datasets B",
    },
  };

export const SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    hcaProjectId: null,
    id: "daf8febc-a38d-4e8e-91be-802aab281f02",
    metadataSpreadsheets: [
      {
        id: ENTRY_SHEET_ID_WITH_UPDATE,
        title: "Entry Sheet With Update",
      },
      {
        id: ENTRY_SHEET_ID_WITH_ERRORED_UPDATE,
        title: "Entry Sheet With Errored Update",
      },
      {
        id: ENTRY_SHEET_ID_NEW,
        title: "Entry Sheet New",
      },
    ],
    unpublishedInfo: {
      contactEmail: "barbazfoobazbar@example.com",
      referenceAuthor: "Bar Baz Foo Baz Bar",
      title: "Source Study With Entry Sheet Validations Foo",
    },
  };

export const SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR: TestPublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    doi: DOI_WITH_ENTRY_SHEET_VALIDATIONS_BAR,
    doiStatus: DOI_STATUS.OK,
    hcaProjectId: null,
    id: "6ffcfd9d-3c51-4ef6-b082-b4e77ebf3327",
    metadataSpreadsheets: [
      {
        id: ENTRY_SHEET_ID_WITH_FAILED_UPDATE,
        title: "Entry Sheet With Failed Update",
      },
      {
        id: ENTRY_SHEET_ID_WITH_MALFORMED_RESPONSE,
        title: "Entry Sheet With Malformed Response",
      },
    ],
    publication: {
      authors: [
        { name: "Author With Entry Sheet Validations Bar", personalName: null },
      ],
      hasPreprintDoi: null,
      journal: "Journal With Entry Sheet Validations Bar",
      preprintOfDoi: null,
      publicationDate: "2025-06-20",
      title: "Published With Entry Sheet Validations Bar",
    },
  };

export const SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAZ: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    hcaProjectId: null,
    id: "e9bee7ff-a894-435a-b5fe-8af4b942cc0c",
    metadataSpreadsheets: [
      {
        id: ENTRY_SHEET_ID_NO_SYNC,
        title: "Entry Sheet No Sync",
      },
    ],
    unpublishedInfo: {
      contactEmail: "barbazbarfoofoo@example.com",
      referenceAuthor: "Bar Baz Bar Foo Foo",
      title: "Source Study With Entry Sheet Validations Baz",
    },
  };

export const SOURCE_STUDY_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    hcaProjectId: null,
    id: "9919078a-0b51-4cd5-995e-ce311aa6e564",
    metadataSpreadsheets: [
      {
        id: ENTRY_SHEET_ID_NEW_NON_SHARED,
        title: "Entry Sheet New Non Shared",
      },
    ],
    unpublishedInfo: {
      contactEmail: "barbazbarfoobar@example.com",
      referenceAuthor: "Bar Baz Bar Foo Bar",
      title: "Source Study With Non Shared Entry Sheet Validations",
    },
  };

// Source study for heatmap testing
export const SOURCE_STUDY_HEATMAP_TEST_FOO: TestUnpublishedSourceStudy = {
  cellxgeneCollectionId: null,
  hcaProjectId: null,
  id: "a559645e-9e11-47cf-90bd-04e7c2b90afa",
  unpublishedInfo: {
    contactEmail: "heatmap-test-foo@example.com",
    referenceAuthor: "Test Author Foo",
    title: "Heatmap Test Source Study Foo",
  },
};

// Source study for heatmap testing
export const SOURCE_STUDY_HEATMAP_TEST_BAR: TestUnpublishedSourceStudy = {
  cellxgeneCollectionId: null,
  hcaProjectId: null,
  id: "b1857909-6554-4083-97fc-0de334ba2d12",
  unpublishedInfo: {
    contactEmail: "heatmap-test-bar@example.com",
    referenceAuthor: "Test Author Bar",
    title: "Heatmap Test Source Study Bar",
  },
};

export const SOURCE_STUDY_MISC_C_FOO: TestUnpublishedSourceStudy = {
  cellxgeneCollectionId: null,
  hcaProjectId: null,
  id: "5ac60a08-351d-4d57-972a-24bd74c96d63",
  unpublishedInfo: {
    contactEmail: "misc-c-foo@example.com",
    referenceAuthor: "Test Author Misc C Foo",
    title: "Source Study Misc C Foo",
  },
};

export const SOURCE_STUDY_MISC_C_BAR: TestUnpublishedSourceStudy = {
  cellxgeneCollectionId: null,
  hcaProjectId: null,
  id: "056a4ade-1702-4338-9386-b9b6406461ef",
  unpublishedInfo: {
    contactEmail: "misc-c-foo@example.com",
    referenceAuthor: "Test Author Misc C Foo",
    title: "Source Study Misc C Foo",
  },
};

export const SOURCE_STUDY_WITH_NON_LATEST_METADATA_ENTITIES: TestUnpublishedSourceStudy =
  {
    cellxgeneCollectionId: null,
    hcaProjectId: null,
    id: "b40fd617-892a-4095-92ec-1162ad72bd3d",
    unpublishedInfo: {
      contactEmail: "barfoobazfoofoobazbar@example.com",
      referenceAuthor: "Baz Baz Foo Baz Foo Baz",
      title: "Source Study With Non Latest Metadata Entities",
    },
  };

// Source studies initialized in the database before tests
export const INITIAL_TEST_SOURCE_STUDIES = [
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_DRAFT_NO_CROSSREF,
  SOURCE_STUDY_PUBLIC_NO_CROSSREF,
  SOURCE_STUDY_PUBLIC_WITH_PREPRINT,
  SOURCE_STUDY_PUBLIC_WITH_JOURNAL,
  SOURCE_STUDY_SHARED,
  SOURCE_STUDY_PUBLISHED_WITH_HCA,
  SOURCE_STUDY_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO,
  SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE,
  SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
  SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
  SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE,
  SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE,
  SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE,
  SOURCE_STUDY_WITH_SOURCE_DATASETS,
  SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS,
  SOURCE_STUDY_PUBLISHED_WITH_NEW_HCA_ID,
  SOURCE_STUDY_PUBLISHED_WITH_UPDATED_HCA_ID,
  SOURCE_STUDY_PUBLISHED_WITH_REMOVED_HCA_ID,
  SOURCE_STUDY_PUBLISHED_WITH_NEW_CELLXGENE_ID,
  SOURCE_STUDY_PUBLISHED_WITH_UPDATED_CELLXGENE_ID,
  SOURCE_STUDY_PUBLISHED_WITH_REMOVED_CELLXGENE_ID,
  SOURCE_STUDY_PUBLISHED_WITH_CHANGING_IDS,
  SOURCE_STUDY_UNPUBLISHED_WITH_HCA,
  SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS,
  SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A,
  SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR,
  SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAZ,
  SOURCE_STUDY_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS,
  SOURCE_STUDY_HEATMAP_TEST_FOO,
  SOURCE_STUDY_HEATMAP_TEST_BAR,
  SOURCE_STUDY_MISC_C_FOO,
  SOURCE_STUDY_MISC_C_BAR,
  SOURCE_STUDY_WITH_NON_LATEST_METADATA_ENTITIES,
];

export const TEST_SOURCE_STUDIES = [...INITIAL_TEST_SOURCE_STUDIES];

// SOURCE DATASETS

export const SOURCE_DATASET_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-foo",
    datasetInfo: {
      assay: ["assay foo"],
      cellCount: 354,
      disease: ["disease foo"],
      geneCount: 234,
      suspensionType: ["suspension type foo"],
      tissue: ["tissue foo"],
      title: "Source Dataset Foo",
    },
    etag: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    eventTime: "2025-08-22T06:10:15.123Z",
    fileName: "source-dataset-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    integrityCheckedAt: "2025-09-07T11:22:25.647Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1234567",
    validationReports: {
      cap: {
        errors: [],
        finishedAt: "2025-09-07T11:22:27.000Z",
        startedAt: "2025-09-07T11:22:26.000Z",
        valid: true,
        warnings: [],
      },
    },
    validationSummary: {
      overallValid: true,
      validators: {
        cap: true,
      },
    },
    versionId: null,
  },
  id: "6e1e281d-78cb-462a-ae29-94663c1e5713",
  reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "653ffca2-694a-434f-9768-7d8a62e60aef",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-bar",
    etag: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    eventTime: "2025-08-22T06:10:32.456Z",
    fileName: "source-dataset-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    sizeBytes: "2345678",
    validationStatus: FILE_VALIDATION_STATUS.REQUEST_FAILED,
    versionId: null,
  },
  id: "cd053619-8b50-4e2d-ba62-96fbbcad6011",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "e03315c4-09bc-477c-9845-192dcdf5c9a5",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_BAZ = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-baz",
    etag: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    eventTime: "2025-08-22T06:10:49.789Z",
    fileName: "source-dataset-baz.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "c3d4e5f6-a7b8-9012-cdef-345678901234",
    sizeBytes: "3456789",
    versionId: null,
  },
  id: "3682751a-7a97-48e1-a43e-d355c1707e26",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "4bd16fcb-fdb8-47b9-ae7e-c7bd2f344af3",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_FOOFOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-foofoo",
    datasetInfo: {
      assay: ["assay foofoo"],
      cellCount: 534,
      disease: ["disease foofoo"],
      geneCount: 435,
      suspensionType: ["suspension type foofoo"],
      tissue: ["tissue foofoo"],
      title: "Source Dataset Foofoo",
    },
    etag: "4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90",
    eventTime: "2025-08-22T06:11:06.012Z",
    fileName: "source-dataset-foofoo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "d4e5f6a7-b8c9-0123-def4-456789012345",
    integrityCheckedAt: "2025-09-08T01:54:18.483Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "4567890",
    versionId: null,
  },
  id: "5c42bc65-93ad-4191-95bc-a40d56f2bb6b",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "c4e093b7-a7dc-45a5-b336-f79d46ad5511",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_FOOBAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-foobar",
    etag: "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9012",
    eventTime: "2025-08-22T06:11:23.345Z",
    fileName: "source-dataset-foobar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "e5f6a7b8-c9d0-1234-ef56-567890123456",
    sizeBytes: "5678901",
    versionId: null,
  },
  id: "4de3dadd-a35c-4386-be62-4536934e9179",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "79543b2d-96dd-43e9-8941-c5dd6c8ad878",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_FOOBAZ = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-foobaz",
    etag: "6f7a8b9c0d1e2f3a4b5c6d7e8f901234",
    eventTime: "2025-08-22T06:11:40.678Z",
    fileName: "source-dataset-foobaz.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "f6a7b8c9-d0e1-2345-fa67-678901234567",
    sizeBytes: "6789012",
    versionId: null,
  },
  id: "7ac2afd8-493d-46e5-b9d8-cadc512bb2cc",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "46c8eafb-5c1e-4a4e-aff1-44ca0933f67a",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-cellxgene-without-update",
    datasetInfo: {
      assay: ["foo"],
      cellCount: 123,
      disease: ["bar"],
      suspensionType: ["foobarbaz"],
      tissue: ["baz"],
      title: "Source Dataset CELLxGENE Without Update",
    },
    etag: "7a8b9c0d1e2f3a4b5c6d7e8f90123456",
    eventTime: "2025-08-22T06:11:57.901Z",
    fileName: "source-dataset-cellxgene-without-update.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "a7b8c9d0-e1f2-3456-ab78-789012345678",
    integrityCheckedAt: "2025-09-13T16:24:10.627Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "7890123",
    versionId: null,
  },
  id: "afcb9181-5a6b-45a8-89c0-1790def2d7dc",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "429a5305-a98c-4051-9224-345e5f174a76",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_CELLXGENE_WITH_UPDATE = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-cellxgene-with-update",
    datasetInfo: {
      assay: ["foobarfoo"],
      cellCount: 4567,
      disease: ["barbarfoo"],
      suspensionType: ["foobazbarfoo"],
      tissue: ["bazbarfoo"],
      title: "Source Dataset CELLxGENE With Update",
    },
    etag: "8b9c0d1e2f3a4b5c6d7e8f9012345678",
    eventTime: "2025-08-22T06:12:14.234Z",
    fileName: "source-dataset-cellxgene-with-update.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "b8c9d0e1-f2a3-4567-bc89-890123456789",
    integrityCheckedAt: "2025-09-03T03:48:30.115Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "8901234",
    versionId: null,
  },
  id: "04ccf7fd-22eb-4236-829c-9a0058580d36",
  metadataSpreadsheetTitle: "Source Dataset CELLxGENE With Update Metadata",
  metadataSpreadsheetUrl:
    "https://docs.google.com/spreadsheets/d/source-dataset-cellxgene-with-update",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  versionId: "79af2ef3-ea4f-41e0-b17f-de182b0931d1",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_DRAFT_OK_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_DRAFT,
    bucket: "bucket-source-dataset-draft-ok-foo",
    etag: "9c0d1e2f3a4b5c6d7e8f901234567890",
    eventTime: "2025-08-22T06:12:31.567Z",
    fileName: "source-dataset-draft-ok-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "c9d0e1f2-a3b4-5678-cd90-901234567890",
    sizeBytes: "9012345",
    versionId: null,
  },
  id: "edf62340-8180-4206-87f2-d95e388a3a4c",
  sourceStudyId: SOURCE_STUDY_DRAFT_OK.id,
  versionId: "bfaf2bcf-ca8d-4b90-a745-b932de19414e",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_DRAFT_OK_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_DRAFT,
    bucket: "bucket-source-dataset-draft-ok-bar",
    etag: "0d1e2f3a4b5c6d7e8f90123456789012",
    eventTime: "2025-08-22T06:12:48.890Z",
    fileName: "source-dataset-draft-ok-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "d0e1f2a3-b4c5-6789-de01-012345678901",
    sizeBytes: "1023456",
    versionId: null,
  },
  id: "3b41d607-05ff-48a7-92bd-9d257a230b3d",
  sourceStudyId: SOURCE_STUDY_DRAFT_OK.id,
  versionId: "146d7163-a4f9-4a9d-92bd-99365b7e2a93",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_OTHER_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-other-foo",
    datasetInfo: {
      assay: ["assay other foo"],
      cellCount: 23424,
      disease: ["disease other foo"],
      suspensionType: ["suspension type other foo"],
      tissue: ["tissue other foo"],
      title: "Source Dataset Other Foo",
    },
    etag: "1e2f3a4b5c6d7e8f9012345678901234",
    eventTime: "2025-08-22T06:13:05.123Z",
    fileName: "source-dataset-other-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "e1f2a3b4-c5d6-7890-ef12-123456789012",
    integrityCheckedAt: "2025-09-04T02:54:12.452Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1134567",
    versionId: null,
  },
  id: "d85cf1fd-3b70-4f6a-812c-583941362117",
  sourceStudyId: SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS.id,
  versionId: "d7ac2d6d-0f4c-4fc9-aa95-74638a2048a9",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_OTHER_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-other-bar",
    datasetInfo: {
      assay: ["assay other bar"],
      cellCount: 23424,
      disease: ["disease other bar"],
      suspensionType: ["suspension type other bar"],
      tissue: ["tissue other bar"],
      title: "Source Dataset Other Bar",
    },
    etag: "2f3a4b5c6d7e8f90123456789012345a",
    eventTime: "2025-08-22T06:13:22.456Z",
    fileName: "source-dataset-other-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "f2a3b4c5-d6e7-8901-fa23-234567890123",
    integrityCheckedAt: "2025-09-12T21:03:10.240Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1245678",
    versionId: null,
  },
  id: "e3878dde-ffe5-4193-9b7f-5a395541ba25",
  sourceStudyId: SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS.id,
  versionId: "95ca4f9c-3541-4f38-bd36-fd14591a2361",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
    bucket: "bucket-source-dataset-unpublished-with-cellxgene-foo",
    datasetInfo: {
      assay: ["assay unpublished with cellxgene foo"],
      cellCount: 5464,
      disease: ["disease unpublished with cellxgene foo"],
      suspensionType: ["suspension type unpublished with cellxgene foo"],
      tissue: ["tissue unpublished with cellxgene foo"],
      title: "Source Dataset Unpublished With CELLxGENE Foo",
    },
    etag: "3a4b5c6d7e8f90123456789012345678",
    eventTime: "2025-08-22T06:13:39.789Z",
    fileName: "source-dataset-unpublished-with-cellxgene-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "a3b4c5d6-e7f8-9012-ab34-345678901234",
    integrityCheckedAt: "2025-09-04T00:25:41.932Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1356789",
    versionId: null,
  },
  id: "1d872ee4-cfb3-4893-a275-fe0f105697c4",
  sourceStudyId: SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
  versionId: "df4cfa4b-287d-4b38-a3eb-9244b1d974d7",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
    bucket: "bucket-source-dataset-unpublished-with-cellxgene-bar",
    datasetInfo: {
      assay: ["assay unpublished with cellxgene bar"],
      cellCount: 3493,
      disease: ["disease unpublished with cellxgene bar"],
      suspensionType: ["suspension type unpublished with cellxgene bar"],
      tissue: ["tissue unpublished with cellxgene bar"],
      title: "Source Dataset Unpublished With CELLxGENE Bar",
    },
    etag: "4b5c6d7e8f90123456789012345678901",
    eventTime: "2025-08-22T06:13:56.012Z",
    fileName: "source-dataset-unpublished-with-cellxgene-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "b4c5d6e7-f8a9-0123-bc45-456789012345",
    integrityCheckedAt: "2025-09-02T12:23:31.888Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1467890",
    versionId: null,
  },
  id: "30bd81d7-1db7-4f28-b6d3-6afa73066f99",
  sourceStudyId: SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
  versionId: "9ca67133-74a5-40fa-a794-54da022c2d69",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAZ = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
    bucket: "bucket-source-dataset-unpublished-with-cellxgene-baz",
    datasetInfo: {
      assay: ["assay unpublished with cellxgene baz"],
      cellCount: 64345,
      disease: ["disease unpublished with cellxgene baz"],
      suspensionType: ["suspension type unpublished with cellxgene baz"],
      tissue: ["tissue unpublished with cellxgene baz"],
      title: "Source Dataset Unpublished With CELLxGENE Baz",
    },
    etag: "5c6d7e8f90123456789012345678901a",
    eventTime: "2025-08-22T06:14:12.345Z",
    fileName: "source-dataset-unpublished-with-cellxgene-baz.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "c5d6e7f8-a9b0-1234-cd56-567890123456",
    integrityCheckedAt: "2025-09-07T20:27:19.728Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1578901",
    versionId: null,
  },
  id: "4b7acc76-89f2-4839-a15c-fc79183c1ed7",
  sourceStudyId: SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
  versionId: "45aabc8d-84cd-4ea7-acc1-cb6263ebfdd0",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-published-without-cellxgene-id-foo",
    datasetInfo: {
      assay: ["assay published without cellxgene id foo"],
      cellCount: 34538,
      disease: ["disease published without cellxgene id foo"],
      suspensionType: ["suspension type published without cellxgene id foo"],
      tissue: ["tissue published without cellxgene id foo"],
      title: "Source Dataset Published Without CELLxGENE ID Foo",
    },
    etag: "6d7e8f90123456789012345678901234",
    eventTime: "2025-08-22T06:14:29.678Z",
    fileName: "source-dataset-published-without-cellxgene-id-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "d6e7f8a9-b0c1-2345-de67-678901234567",
    integrityCheckedAt: "2025-09-05T00:52:10.661Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1689012",
    versionId: null,
  },
  id: "68dbf3ec-45a5-43a4-b806-97923de1df2c",
  sourceStudyId: SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID.id,
  versionId: "f42e9133-2a47-470b-bb90-43abc536a8ed",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-published-without-cellxgene-id-bar",
    datasetInfo: {
      assay: ["assay published without cellxgene id bar"],
      cellCount: 2348,
      disease: ["disease published without cellxgene id bar"],
      suspensionType: ["suspension type published without cellxgene id bar"],
      tissue: ["tissue published without cellxgene id bar"],
      title: "Source Dataset Published Without CELLxGENE ID Bar",
    },
    etag: "7e8f90123456789012345678901234ab",
    eventTime: "2025-08-22T06:14:46.901Z",
    fileName: "source-dataset-published-without-cellxgene-id-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "e7f8a9b0-c1d2-3456-ef78-789012345678",
    integrityCheckedAt: "2025-09-08T07:20:33.987Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1790123",
    versionId: null,
  },
  id: "2d4f2d93-7c2c-4c1f-94af-566f3d3ed8ec",
  sourceStudyId: SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID.id,
  versionId: "28f4087f-6051-4268-a7d0-1578571f2eac",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ATLAS_LINKED_A_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-atlas-linked-a-foo",
    datasetInfo: {
      assay: ["assay atlas linked a foo"],
      cellCount: 3982,
      disease: ["disease atlas linked a foo"],
      suspensionType: ["suspension type atlas linked a foo"],
      tissue: ["tissue atlas linked a foo"],
      title: "Source Dataset Atlas Linked A Foo",
    },
    etag: "8f90123456789012345678901234567b",
    eventTime: "2025-08-22T06:15:03.234Z",
    fileName: "source-dataset-atlas-linked-a-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "f8a9b0c1-d2e3-4567-fa89-890123456789",
    integrityCheckedAt: "2025-09-13T07:38:02.243Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1801234",
    validationReports: {
      cap: {
        errors: [],
        finishedAt: "2025-09-13T07:38:04.000Z",
        startedAt: "2025-09-13T07:38:03.000Z",
        valid: true,
        warnings: [],
      },
    },
    validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
    validationSummary: {
      overallValid: true,
      validators: {
        cap: true,
      },
    },
    versionId: null,
  },
  id: "4d08641d-be55-440b-8a19-b67c965cc2bf",
  reprocessedStatus: REPROCESSED_STATUS.REPROCESSED,
  sourceStudyId: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
  versionId: "d5788ef0-9538-4a15-ad08-0003d3b0110e",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ATLAS_LINKED_A_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-atlas-linked-a-bar",
    etag: "12345678901234567b8f901234567890",
    eventTime: "2025-09-14T19:31:56.685Z",
    fileName: "source-dataset-atlas-linked-a-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "cd32420d-f540-4f97-87c8-41872c05d9a4",
    sizeBytes: "45345",
    versionId: null,
  },
  id: "41e20a89-48c4-4fd6-85b1-6f6a02f03b35",
  reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
  sourceStudyId: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
  versionId: "31f9cd17-79ad-4ea6-8b3d-7b9845b9dcbe",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ATLAS_LINKED_B_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-atlas-linked-b-foo",
    datasetInfo: {
      assay: ["assay atlas linked b foo"],
      cellCount: 81283,
      disease: ["disease atlas linked b foo"],
      suspensionType: ["suspension type atlas linked b foo"],
      tissue: ["tissue atlas linked b foo"],
      title: "Source Dataset Atlas Linked B Foo",
    },
    etag: "90123456789012345678901234567890",
    eventTime: "2025-08-22T06:15:20.567Z",
    fileName: "source-dataset-atlas-linked-b-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "a9b0c1d2-e3f4-5678-ab90-901234567890",
    integrityCheckedAt: "2025-09-06T15:56:28.738Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1912345",
    versionId: null,
  },
  id: "9d361a63-78bb-487c-8af5-160de4782eb2",
  sourceStudyId: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B.id,
  versionId: "82c5fc22-e3b3-4c5a-acdf-f79cfcb3b3ff",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ATLAS_LINKED_B_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-atlas-linked-b-bar",
    datasetInfo: {
      assay: ["assay atlas linked b bar"],
      cellCount: 12353,
      disease: ["disease atlas linked b bar"],
      suspensionType: ["suspension type atlas linked b bar"],
      tissue: ["tissue atlas linked b bar"],
      title: "Source Dataset Atlas Linked B Bar",
    },
    etag: "01234567890123456789012345678901",
    eventTime: "2025-08-22T06:15:37.890Z",
    fileName: "source-dataset-atlas-linked-b-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "b0c1d2e3-f4a5-6789-bc01-012345678901",
    integrityCheckedAt: "2025-09-06T17:35:23.493Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "2023456",
    versionId: null,
  },
  id: "a710a258-c48c-4185-9d28-9e9429c989fd",
  metadataSpreadsheetUrl: "https://docs.google.com/spreadsheets/baz",
  sourceStudyId: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B.id,
  versionId: "b838a396-1b58-4904-bd30-ef7820b98491",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ATLAS_LINKED_B_BAZ = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-source-dataset-atlas-linked-b-baz",
    datasetInfo: {
      assay: ["assay atlas linked b baz"],
      cellCount: 38429,
      disease: ["disease atlas linked b baz"],
      suspensionType: ["suspension type atlas linked b baz"],
      tissue: ["tissue atlas linked b baz"],
      title: "Source Dataset Atlas Linked B Baz",
    },
    etag: "12345678901234567890123456789012",
    eventTime: "2025-08-22T06:15:54.123Z",
    fileName: "source-dataset-atlas-linked-b-baz.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "c1d2e3f4-a5b6-7890-cd12-123456789012",
    integrityCheckedAt: "2025-09-05T09:44:43.235Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "2134567",
    versionId: null,
  },
  id: "79446f6f-0f3a-4915-a019-090189947223",
  sourceStudyId: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B.id,
  versionId: "9aa3f4ca-7987-4d2e-af5f-b67488040da4",
} satisfies TestSourceDataset;

const BASE_FILE_SOURCE_DATASET_WITH_MULTIPLE_FILES = {
  atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  bucket: "bucket-source-dataset-with-multiple-files",
  datasetInfo: {
    assay: ["assay with multiple files"],
    cellCount: 6457,
    disease: ["disease with multiple files"],
    suspensionType: ["suspension type with multiple files"],
    tissue: ["tissue with multiple files"],
    title: "Source Dataset With Multiple Files",
  },
  fileName: "source-dataset-with-multiple-files.h5ad",
  fileType: FILE_TYPE.SOURCE_DATASET,
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_SOURCE_DATASET_WITH_MULTIPLE_FILES = {
  ...BASE_FILE_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  etag: "620667d77ed3460983851d94b9ea30c5",
  eventTime: "2025-09-16T02:22:05.004Z",
  id: "d27b67ec-5b2f-4211-ad69-20bd5f5d3634",
  integrityCheckedAt: "2025-09-16T02:24:14.022Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
  sizeBytes: "234234",
} satisfies TestFile;
export const FILE_B_SOURCE_DATASET_WITH_MULTIPLE_FILES = {
  ...BASE_FILE_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  etag: "b4a2018644c54214b0a5beb17fa41ee1",
  eventTime: "2025-09-16T02:46:30.663Z",
  id: "9b2e29f2-5864-4bee-ae8b-22cb8a101b24",
  integrityCheckedAt: "2025-09-16T02:47:14.216Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
  sizeBytes: "345345",
} satisfies TestFile;
export const FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES = {
  ...BASE_FILE_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  etag: "a3acab069db94cbe81eb4eeaaad04df1",
  eventTime: "2025-09-16T02:47:35.035Z",
  id: "c42081da-f7e3-4fdb-b8c5-c02854215659",
  integrityCheckedAt: "2025-09-16T02:48:08.838Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  sizeBytes: "434534",
} satisfies TestFile;
export const SOURCE_DATASET_ID_WITH_MULTIPLE_FILES =
  "3a4658fa-049f-4465-9a10-9f411dbcfb7c";
const BASE_SOURCE_DATASET_WITH_MULTIPLE_FILES = {
  id: SOURCE_DATASET_ID_WITH_MULTIPLE_FILES,
  sourceStudyId: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
} satisfies Partial<TestSourceDataset>;
export const SOURCE_DATASET_WITH_MULTIPLE_FILES_W1 = {
  file: FILE_A_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  isLatest: false,
  versionId: "5f7d5028-ac69-43f0-aae4-259731076652",
  wipNumber: 1,
  ...BASE_SOURCE_DATASET_WITH_MULTIPLE_FILES,
} satisfies TestSourceDataset;
export const SOURCE_DATASET_WITH_MULTIPLE_FILES_W2 = {
  file: FILE_B_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  isLatest: false,
  versionId: "5f13b0af-e791-4561-acd0-de913a1b7aba",
  wipNumber: 2,
  ...BASE_SOURCE_DATASET_WITH_MULTIPLE_FILES,
} satisfies TestSourceDataset;
export const SOURCE_DATASET_WITH_MULTIPLE_FILES_W3 = {
  file: FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  isLatest: true,
  versionId: "b86ee24e-9b90-4094-afd6-abe94450fdcf",
  wipNumber: 3,
  ...BASE_SOURCE_DATASET_WITH_MULTIPLE_FILES,
} satisfies TestSourceDataset;

const BASE_FILE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO = {
  atlas: (): TestAtlas => ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  bucket: "bucket-source-dataset-non-latest-metadata-entities-foo",
  datasetInfo: {
    assay: ["assay non latest metadata entities foo"],
    cellCount: 7832,
    disease: ["disease non latest metadata entities foo"],
    suspensionType: ["suspension type non latest metadata entities foo"],
    tissue: ["tissue non latest metadata entities foo"],
    title: "Source Dataset Non Latest Metadata Entities Foo",
  },
  fileName: "source-dataset-non-latest-metadata-entities-foo.h5ad",
  fileType: FILE_TYPE.SOURCE_DATASET,
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO = {
  ...BASE_FILE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO,
  etag: "f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
  eventTime: "2025-11-04T11:15:20.123Z",
  id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  integrityCheckedAt: "2025-11-04T11:15:45.456Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
  sizeBytes: "123456",
} satisfies TestFile;
export const FILE_B_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO = {
  ...BASE_FILE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO,
  etag: "a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7",
  eventTime: "2025-11-04T11:20:30.234Z",
  id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  integrityCheckedAt: "2025-11-04T11:20:55.567Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  sizeBytes: "234567",
} satisfies TestFile;
export const SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_FOO =
  "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f";
const BASE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO = {
  id: SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_FOO,
} satisfies Partial<TestSourceDataset>;
export const SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W1 = {
  file: FILE_A_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO,
  isLatest: false,
  versionId: "7a0757ec-df66-4c76-a8ee-1df519c9d9bc",
  wipNumber: 1,
  ...BASE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO,
} satisfies TestSourceDataset;
export const SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2 = {
  file: FILE_B_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO,
  isLatest: true,
  versionId: "64d5c608-9b5c-4b10-9319-4725f2cadebf",
  wipNumber: 2,
  ...BASE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO,
} satisfies TestSourceDataset;

const BASE_FILE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR = {
  atlas: (): TestAtlas => ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  bucket: "bucket-source-dataset-non-latest-metadata-entities-bar",
  datasetInfo: {
    assay: ["assay non latest metadata entities bar"],
    cellCount: 9456,
    disease: ["disease non latest metadata entities bar"],
    suspensionType: ["suspension type non latest metadata entities bar"],
    tissue: ["tissue non latest metadata entities bar"],
    title: "Source Dataset Non Latest Metadata Entities Bar",
  },
  fileName: "source-dataset-non-latest-metadata-entities-bar.h5ad",
  fileType: FILE_TYPE.SOURCE_DATASET,
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR = {
  ...BASE_FILE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
  etag: "b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
  eventTime: "2025-11-05T12:25:35.345Z",
  id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  integrityCheckedAt: "2025-11-05T12:26:00.678Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
  sizeBytes: "345678",
} satisfies TestFile;
export const FILE_B_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR = {
  ...BASE_FILE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
  etag: "c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9",
  eventTime: "2025-11-05T12:30:45.456Z",
  id: "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
  integrityCheckedAt: "2025-11-05T12:31:10.789Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
  sizeBytes: "456789",
} satisfies TestFile;
export const FILE_C_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR = {
  ...BASE_FILE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
  etag: "d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
  eventTime: "2025-11-05T12:35:55.567Z",
  id: "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
  integrityCheckedAt: "2025-11-05T12:36:20.890Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  sizeBytes: "567890",
} satisfies TestFile;
export const SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR =
  "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d";
const BASE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR = {
  id: SOURCE_DATASET_ID_NON_LATEST_METADATA_ENTITIES_BAR,
  sourceStudyId: SOURCE_STUDY_WITH_NON_LATEST_METADATA_ENTITIES.id,
} satisfies Partial<TestSourceDataset>;
export const SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W1 = {
  file: FILE_A_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
  isLatest: false,
  versionId: "4f779a26-4e6b-4d83-9a90-f41102448031",
  wipNumber: 1,
  ...BASE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
} satisfies TestSourceDataset;
export const SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2 = {
  file: FILE_B_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
  isLatest: false,
  versionId: "c050d548-d4bb-4cf8-a9b3-1dcf7efe362c",
  wipNumber: 2,
  ...BASE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
} satisfies TestSourceDataset;
export const SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W3 = {
  file: FILE_C_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
  isLatest: true,
  versionId: "aa52dc91-0c52-4532-abe1-98fa06aa2b05",
  wipNumber: 3,
  ...BASE_SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR,
} satisfies TestSourceDataset;

const BASE_FILE_SOURCE_DATASET_WITH_ARCHIVED_LATEST = {
  atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  bucket: "bucket-source-dataset-with-archived-latest",
  datasetInfo: {
    assay: ["assay with archived latest"],
    cellCount: 34536,
    disease: ["disease with archived latest"],
    suspensionType: ["suspension type with archived latest"],
    tissue: ["tissue with archived latest"],
    title: "Source Dataset With Archived Latest",
  },
  fileName: "source-dataset-with-archived-latest.h5ad",
  fileType: FILE_TYPE.SOURCE_DATASET,
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_SOURCE_DATASET_WITH_ARCHIVED_LATEST = {
  ...BASE_FILE_SOURCE_DATASET_WITH_ARCHIVED_LATEST,
  etag: "ddebba323f2d42fda2164b4aa3b80022",
  eventTime: "2025-10-06T04:59:05.969Z",
  id: "ce6807b8-e167-46ba-8d94-bb226d1cef2c",
  isArchived: false,
  isLatest: false,
  sizeBytes: "23523",
} satisfies TestFile;
export const FILE_B_SOURCE_DATASET_WITH_ARCHIVED_LATEST = {
  ...BASE_FILE_SOURCE_DATASET_WITH_ARCHIVED_LATEST,
  etag: "42df8de8ee5141f28c6e85719f2b0c1c",
  eventTime: "2025-10-06T05:00:21.048Z",
  id: "68c397ac-a0e4-4177-a0d9-dd7e2d4c7c19",
  isArchived: true,
  isLatest: true,
  sizeBytes: "345345",
} satisfies TestFile;
export const SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST =
  "63b33e2a-1b1f-4138-bc54-dbe42e12ab65";
const BASE_SOURCE_DATASET_WITH_ARCHIVED_LATEST = {
  id: SOURCE_DATASET_ID_WITH_ARCHIVED_LATEST,
  sourceStudyId: SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
} satisfies Partial<TestSourceDataset>;
export const SOURCE_DATASET_WITH_ARCHIVED_LATEST_W1 = {
  file: FILE_A_SOURCE_DATASET_WITH_ARCHIVED_LATEST,
  isLatest: false,
  versionId: "9631942f-45ff-42a8-bca5-dac9cd8f3821",
  wipNumber: 1,
  ...BASE_SOURCE_DATASET_WITH_ARCHIVED_LATEST,
} satisfies TestSourceDataset;
export const SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2 = {
  file: FILE_B_SOURCE_DATASET_WITH_ARCHIVED_LATEST,
  isLatest: true,
  versionId: "36069d02-ed63-4234-801e-0dfa686ef9fd",
  wipNumber: 2,
  ...BASE_SOURCE_DATASET_WITH_ARCHIVED_LATEST,
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ARCHIVED_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-source-dataset-archived-foo",
    datasetInfo: {
      assay: ["assay archived foo"],
      cellCount: 89177,
      disease: ["disease archived foo"],
      suspensionType: ["suspension type archived foo"],
      tissue: ["tissue archived foo"],
      title: "Source Dataset Archived Foo",
    },
    etag: "851b65225a794fc091d06e48140894a0",
    eventTime: "2025-10-10T06:51:30.023Z",
    fileName: "source-dataset-archived-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "5c39e407-4271-46d8-91dd-17ab17c0933c",
    integrityCheckedAt: "2025-10-10T06:51:30.023Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "45106",
    versionId: null,
  },
  id: "bbf9aa61-4d0b-4c2d-bb05-42b3e3e2c9cc",
  versionId: "5e00a472-d119-4c50-b7ef-ceea83460ae6",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ARCHIVED_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-source-dataset-archived-bar",
    datasetInfo: {
      assay: ["assay archived bar"],
      cellCount: 57223,
      disease: ["disease archived bar"],
      suspensionType: ["suspension type archived bar"],
      tissue: ["tissue archived bar"],
      title: "Source Dataset Archived Bar",
    },
    etag: "ba843d41542d444abceefbce86a002e7",
    eventTime: "2025-10-10T06:51:53.053Z",
    fileName: "source-dataset-archived-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "e4400858-ff80-40b5-b591-d4675f2cb893",
    integrityCheckedAt: "2025-10-10T06:51:53.053Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "5114",
    versionId: null,
  },
  id: "54189845-0934-4c3c-97b8-c8113295f227",
  versionId: "24dd8412-09dc-4de3-bdfd-8d763ad42293",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ARCHIVED_BAZ = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-source-dataset-archived-baz",
    datasetInfo: {
      assay: ["assay archived baz"],
      cellCount: 97810,
      disease: ["disease archived baz"],
      suspensionType: ["suspension type archived baz"],
      tissue: ["tissue archived baz"],
      title: "Source Dataset Archived Baz",
    },
    etag: "038410259ad4407e84c1b74f27bd2582",
    eventTime: "2025-10-10T06:52:03.633Z",
    fileName: "source-dataset-archived-baz.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "c180741d-1825-4533-800f-6ce38b9d8ac1",
    integrityCheckedAt: "2025-10-10T06:52:03.633Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "59944",
    versionId: null,
  },
  id: "986da052-8827-4b30-80ba-d529f7410458",
  versionId: "92c3a46d-205a-496a-9b82-93c0589253bd",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ARCHIVED_FOOFOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-source-dataset-archived-foofoo",
    datasetInfo: {
      assay: ["assay archived foofoo"],
      cellCount: 56661,
      disease: ["disease archived foofoo"],
      suspensionType: ["suspension type archived foofoo"],
      tissue: ["tissue archived foofoo"],
      title: "Source Dataset Archived Foofoo",
    },
    etag: "1aafb1705c084a1eb86a51bf32f985a4",
    eventTime: "2025-10-10T07:12:33.816Z",
    fileName: "source-dataset-archived-foofoo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "39091854-9abd-4fc1-b86a-6116b06914d5",
    integrityCheckedAt: "2025-10-10T07:12:33.816Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "62582",
    versionId: null,
  },
  id: "529f8d07-7a22-4831-b61f-983525429e00",
  versionId: "1bcb98c3-a739-4fbd-8f5f-74830dd30afc",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_ARCHIVED_FOOBAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-source-dataset-archived-foobar",
    datasetInfo: {
      assay: ["assay archived foobar"],
      cellCount: 58102,
      disease: ["disease archived foobar"],
      suspensionType: ["suspension type archived foobar"],
      tissue: ["tissue archived foobar"],
      title: "Source Dataset Archived Foobar",
    },
    etag: "bf5c9a11c71f469e86906bd47e084d87",
    eventTime: "2025-10-10T07:13:24.931Z",
    fileName: "source-dataset-archived-foobar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "8a491fdc-83c9-4f12-92a5-536ce5b2ddd5",
    integrityCheckedAt: "2025-10-10T07:13:24.931Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "19506",
    versionId: null,
  },
  id: "eb332ace-438e-45c6-8cf6-58cba44d6d3c",
  versionId: "5adece8c-7fd9-4fcd-bb37-b30c9dc2c476",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_WITHOUT_SOURCE_STUDY_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_C,
    bucket: "bucket-source-dataset-without-source-study-foo",
    etag: "c36ebc5dd93c458bab490b9d35426e90",
    eventTime: "2025-11-11T20:38:19.510Z",
    fileName: "source-dataset-without-source-study-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "941bdbdf-d9c9-4ce2-85f8-8bd724dcde62",
    integrityStatus: INTEGRITY_STATUS.PENDING,
    sizeBytes: "5243",
    versionId: null,
  },
  id: "f9d93c6a-e7c0-4f26-8198-2474e7569bdb",
  versionId: "2077de8f-b9c4-40e6-8764-367caae46bdb",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_WITHOUT_SOURCE_STUDY_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_C,
    bucket: "bucket-source-dataset-without-source-study-bar",
    etag: "6ffd5857856f4172856f51286814a940",
    eventTime: "2025-11-11T20:38:27.070Z",
    fileName: "source-dataset-without-source-study-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "5fa72281-4b69-4135-8f0d-e1a2c0f90cd1",
    integrityStatus: INTEGRITY_STATUS.PENDING,
    isArchived: true,
    sizeBytes: "3534",
    versionId: null,
  },
  id: "aceff568-5782-44f6-b7f8-73c233c5f290",
  versionId: "d818c23c-cb73-49d0-aba7-661111b10723",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_WITH_SOURCE_STUDY_FOO = {
  capUrl: "https://celltype.info/project/345323",
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_C,
    bucket: "bucket-source-dataset-with-source-study-foo",
    etag: "806990f304e445659a2ca3d8931b33e5",
    eventTime: "2025-11-11T20:38:27.070Z",
    fileName: "source-dataset-with-source-study-foo.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "61c61281-3aff-41c9-bc2c-15d935ebb645",
    integrityStatus: INTEGRITY_STATUS.PENDING,
    sizeBytes: "2362",
    versionId: null,
  },
  id: "f91078f9-7e28-4797-8ad4-9410319feba5",
  sourceStudyId: SOURCE_STUDY_MISC_C_FOO.id,
  versionId: "cdf4ed9b-90b5-4a67-a2f6-120ea84401bf",
} satisfies TestSourceDataset;

export const SOURCE_DATASET_WITH_SOURCE_STUDY_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_C,
    bucket: "bucket-source-dataset-with-source-study-bar",
    etag: "4ed5a8a488974ca3948c43a96cf8bb8f",
    eventTime: "2025-11-11T20:38:29.522Z",
    fileName: "source-dataset-with-source-study-bar.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "a3b855b0-13a3-42c7-8924-8016f52ca423",
    integrityStatus: INTEGRITY_STATUS.PENDING,
    sizeBytes: "23425",
    versionId: null,
  },
  id: "890538d1-3ce4-4c18-a6bb-08988130d917",
  sourceStudyId: SOURCE_STUDY_MISC_C_FOO.id,
  versionId: "34ff6cf5-c049-4f0f-af21-725921854e8d",
} satisfies TestSourceDataset;

const SOURCE_DATASET_ID_OUTDATED_FILENAME =
  "f0a1b2c3-d4e5-4f6a-b7c8-d9e0f1a2b3c4";
export const SOURCE_DATASET_WITH_OUTDATED_FILENAME = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_C,
    bucket: "bucket-source-dataset-with-outdated-filename",
    etag: "8d4e9f2a6b3c7e1d5a8f4b2e9c6d3a7f",
    eventTime: "2025-12-03T09:47:22.581Z",
    fileName: "source-dataset-with-outdated-filename-OUTDATED.h5ad",
    fileType: FILE_TYPE.SOURCE_DATASET,
    id: "d7e8f9a0-b1c2-4d3e-8f4a-5b6c7d8e9f0a",
    sizeBytes: "463453",
    versionId: null,
  },
  id: SOURCE_DATASET_ID_OUTDATED_FILENAME,
  versionId: "a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
  wipNumber: 7,
} satisfies TestSourceDataset;

// Source datasets intitialized in the database before tests
export const INITIAL_TEST_SOURCE_DATASETS: TestSourceDataset[] = [
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_BAZ,
  SOURCE_DATASET_FOOFOO,
  SOURCE_DATASET_FOOBAR,
  SOURCE_DATASET_FOOBAZ,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_DRAFT_OK_FOO,
  SOURCE_DATASET_DRAFT_OK_BAR,
  SOURCE_DATASET_OTHER_FOO,
  SOURCE_DATASET_OTHER_BAR,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
  SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAZ,
  SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
  SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_ATLAS_LINKED_A_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_FOO,
  SOURCE_DATASET_ATLAS_LINKED_B_BAR,
  SOURCE_DATASET_ATLAS_LINKED_B_BAZ,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W1,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  SOURCE_DATASET_WITH_MULTIPLE_FILES_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W1,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W1,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W3,
  SOURCE_DATASET_WITH_ARCHIVED_LATEST_W1,
  SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2,
  SOURCE_DATASET_ARCHIVED_FOO,
  SOURCE_DATASET_ARCHIVED_BAR,
  SOURCE_DATASET_ARCHIVED_BAZ,
  SOURCE_DATASET_ARCHIVED_FOOFOO,
  SOURCE_DATASET_ARCHIVED_FOOBAR,
  SOURCE_DATASET_WITHOUT_SOURCE_STUDY_FOO,
  SOURCE_DATASET_WITHOUT_SOURCE_STUDY_BAR,
  SOURCE_DATASET_WITH_SOURCE_STUDY_FOO,
  SOURCE_DATASET_WITH_SOURCE_STUDY_BAR,
  SOURCE_DATASET_WITH_OUTDATED_FILENAME,
];

// ATLAS IDS

const ATLAS_ID_DRAFT = "823dcc68-340b-4a61-8883-c61dc4975ce3";
const ATLAS_ID_PUBLIC = "94f62ad0-99cb-4f01-a1cf-cce2d56a8850";
const ATLAS_ID_WITH_MISC_SOURCE_STUDIES =
  "8259a9b1-c149-4310-83a5-d126b675c0f1";
const ATLAS_ID_WITH_MISC_SOURCE_STUDIES_B =
  "1d58c9eb-ff76-4a23-a579-380a96a9125a";
const ATLAS_ID_WITH_MISC_SOURCE_STUDIES_C =
  "88ee30bb-dfe5-4c23-9f4c-e03c7353d515";
const ATLAS_ID_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS =
  "c41f8dd8-93ee-49f6-885a-8c5107d30229";
const ATLAS_ID_WITH_ENTRY_SHEET_VALIDATIONS_A =
  "035f5b25-7a2a-4351-9f61-5e6734f1f6dc";

// USERS

export const USER_NONEXISTENT = makeTestUser("test-nonexistant");
export const USER_NEW = makeTestUser("test-new");

export const USER_UNREGISTERED = makeTestUser("test-unregistered");
export const USER_STAKEHOLDER = makeTestUser(
  "test-stakeholder",
  ROLE.STAKEHOLDER,
);
export const USER_STAKEHOLDER2 = makeTestUser(
  "test-stakeholder2",
  ROLE.STAKEHOLDER,
);
export const USER_DISABLED = makeTestUser(
  "test-disabled",
  ROLE.STAKEHOLDER,
  true,
);
export const USER_CONTENT_ADMIN = makeTestUser(
  "test-content-admin",
  ROLE.CONTENT_ADMIN,
);
export const USER_INTEGRATION_LEAD_DRAFT = makeTestUser(
  "test-integration-lead-draft",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_DRAFT],
);
export const USER_INTEGRATION_LEAD_PUBLIC = makeTestUser(
  "test-integration-lead-public",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_PUBLIC],
);
export const USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES = makeTestUser(
  "test-integration-lead-with-misc-source-studies",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES],
);
export const USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B = makeTestUser(
  "test-integration-lead-with-misc-source-studies-b",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES_B],
);
export const USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_C = makeTestUser(
  "test-integration-lead-with-misc-source-studies-c",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES_C],
);
export const USER_INTEGRATION_LEAD_WITH_NEW_ATLAS = makeTestUser(
  "test-integration-lead-with-new-atlas",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_DRAFT],
);
export const USER_CELLXGENE_ADMIN = makeTestUser(
  "test-cellxgene-admin",
  ROLE.CELLXGENE_ADMIN,
);
export const USER_DISABLED_CONTENT_ADMIN = makeTestUser(
  "test-disabled-content-admin",
  ROLE.CONTENT_ADMIN,
  true,
);
export const USER_INTEGRATION_LEAD_WITH_ENTRY_SHEET_VALIDATIONS_A =
  makeTestUser(
    "test-integration-lead-with-entry-sheet-validations-a",
    ROLE.INTEGRATION_LEAD,
    false,
    [ATLAS_ID_WITH_ENTRY_SHEET_VALIDATIONS_A],
  );
export const USER_INTEGRATION_LEAD_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS =
  makeTestUser(
    "test-integration-lead-with-non-shared-entry-sheet-validations",
    ROLE.INTEGRATION_LEAD,
    false,
    [ATLAS_ID_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS],
  );

// Users initialized in the database before tests
export const INITIAL_TEST_USERS = [
  USER_DISABLED,
  USER_STAKEHOLDER,
  USER_STAKEHOLDER2,
  USER_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_DRAFT,
  USER_INTEGRATION_LEAD_PUBLIC,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B,
  USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_C,
  USER_INTEGRATION_LEAD_WITH_NEW_ATLAS,
  USER_CELLXGENE_ADMIN,
  USER_DISABLED_CONTENT_ADMIN,
  USER_INTEGRATION_LEAD_WITH_ENTRY_SHEET_VALIDATIONS_A,
  USER_INTEGRATION_LEAD_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS,
];

export const TEST_USERS = [
  ...INITIAL_TEST_USERS,
  USER_UNREGISTERED,
  USER_NONEXISTENT,
  USER_NEW,
];

export const DEFAULT_USERS_BY_ROLE = {
  [ROLE.CELLXGENE_ADMIN]: USER_CELLXGENE_ADMIN,
  [ROLE.CONTENT_ADMIN]: USER_CONTENT_ADMIN,
  [ROLE.INTEGRATION_LEAD]: USER_INTEGRATION_LEAD_DRAFT,
  [ROLE.STAKEHOLDER]: USER_STAKEHOLDER,
  [ROLE.UNREGISTERED]: USER_UNREGISTERED,
};

export const INTEGRATION_LEADS_BY_ATLAS_ID: Record<string, TestUser> = {
  [ATLAS_ID_DRAFT]: USER_INTEGRATION_LEAD_DRAFT,
  [ATLAS_ID_PUBLIC]: USER_INTEGRATION_LEAD_PUBLIC,
  [ATLAS_ID_WITH_ENTRY_SHEET_VALIDATIONS_A]:
    USER_INTEGRATION_LEAD_WITH_ENTRY_SHEET_VALIDATIONS_A,
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES]:
    USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES_B]:
    USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_B,
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES_C]:
    USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES_C,
  [ATLAS_ID_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS]:
    USER_INTEGRATION_LEAD_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS,
};

// COMPONENT ATLASES

export const EMPTY_COMPONENT_INFO = {
  capUrl: null,
} satisfies HCAAtlasTrackerDBComponentAtlasInfo;

export const COMPONENT_ATLAS_DRAFT_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_DRAFT,
    bucket: "bucket-draft-foo",
    etag: "6b8f00707b574ca28e43a7568a2eaca1",
    eventTime: "2025-08-22T05:45:49.432Z",
    fileName: "component-atlas-draft-foo.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "2dfcd615-391f-452c-b981-d0124583c97f",
    sizeBytes: "2342325",
    versionId: null,
  },
  id: "b1820416-5886-4585-b0fe-7f70487331d8",
  sourceDatasets: [
    SOURCE_DATASET_FOOFOO,
    SOURCE_DATASET_FOOBAR,
    SOURCE_DATASET_FOOBAZ,
  ],
  versionId: "0b90d764-dc6a-4f4a-8a13-596e4812cb7d",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_DRAFT_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_DRAFT,
    bucket: "bucket-draft-bar",
    datasetInfo: {
      assay: ["assay draft bar"],
      cellCount: 453453,
      disease: ["disease draft bar"],
      geneCount: 123234,
      suspensionType: ["suspension type draft bar"],
      tissue: ["tissue draft bar"],
      title: "Component Atlas Draft Bar",
    },
    etag: "7c9f11808c685db39f54b8679b3fbcb2",
    eventTime: "2025-08-22T05:46:12.567Z",
    fileName: "component-atlas-draft-bar.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "3efde726-402f-563d-c092-e1235694d08f",
    integrityCheckedAt: "2025-09-15T01:09:19.036Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1987456",
    validationReports: {
      cap: {
        errors: [],
        finishedAt: "2025-09-15T01:09:21.000Z",
        startedAt: "2025-09-15T01:09:20.000Z",
        valid: true,
        warnings: [],
      },
    },
    validationSummary: {
      overallValid: true,
      validators: {
        cap: true,
      },
    },
    versionId: null,
  },
  id: "484bc93b-836d-4efe-880a-de90eb1c4dfb",
  sourceDatasets: [
    SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
    SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  ],
  versionId: "e57cdeb3-5694-479a-b7b1-3b68ec01cf17",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_MISC_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-misc-foo",
    datasetInfo: {
      assay: ["assay misc foo"],
      cellCount: 534534,
      disease: ["disease misc foo"],
      suspensionType: ["suspension type misc foo"],
      tissue: ["tissue misc foo"],
      title: "Component Atlas Misc Foo",
    },
    etag: "8d0a22919d796ec40a65c9780c4acdbe",
    eventTime: "2025-08-22T05:46:35.891Z",
    fileName: "component-atlas-misc-foo.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "4faef837-513a-674e-d103-f2346705e19b",
    integrityCheckedAt: "2025-09-15T01:11:04.489Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "3456789",
    versionId: null,
  },
  id: "b95614cc-5356-4f47-b3a2-da05d23e86ce",
  sourceDatasets: [
    SOURCE_DATASET_FOO,
    SOURCE_DATASET_FOOFOO,
    SOURCE_DATASET_OTHER_FOO,
    SOURCE_DATASET_OTHER_BAR,
  ],
  versionId: "60a0db23-8918-4145-8893-d7efd3e7c44c",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_MISC_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-misc-bar",
    datasetInfo: {
      assay: ["assay misc bar"],
      cellCount: 645645,
      disease: ["disease misc bar"],
      suspensionType: ["suspension type misc bar"],
      tissue: ["tissue misc bar"],
      title: "Component Atlas Misc Bar",
    },
    etag: "9e1b33a2ae8a7fd51b76da891d5bcdcf",
    eventTime: "2025-08-22T06:47:36.892Z",
    fileName: "component-atlas-misc-bar.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "c8286c32-6e7a-40c4-89cc-175ac7361b61",
    integrityCheckedAt: "2025-09-15T02:12:05.590Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "4567890",
    versionId: null,
  },
  id: "c8286c32-6e7a-40c4-89cc-175ac7361b61",
  sourceDatasets: [],
  versionId: "3f2bfe87-e5a8-492a-a926-47af2171e1e2",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_MISC_BAZ = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES,
    bucket: "bucket-misc-baz",
    datasetInfo: {
      assay: ["assay misc baz"],
      cellCount: 756756,
      disease: ["disease misc baz"],
      suspensionType: ["suspension type misc baz"],
      tissue: ["tissue misc baz"],
      title: "Component Atlas Misc Baz",
    },
    etag: "af2c44b3bf9b8ge62c87eb9a2e6cdde0",
    eventTime: "2025-08-22T07:48:37.893Z",
    fileName: "component-atlas-misc-baz.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "a28ef7cb-16f9-490e-b92c-fbe507cbf135",
    integrityCheckedAt: "2025-09-15T03:13:06.691Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "5678901",
    versionId: null,
  },
  id: "23f603d3-57cd-44b9-a3c0-14e671fb2835",
  sourceDatasets: [],
  versionId: "89b3236e-64ed-45cf-997a-9816d01bc1ff",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
    bucket: "bucket-cellxgene-datasets",
    datasetInfo: {
      assay: ["assay with cellxgene datasets"],
      cellCount: 90898,
      disease: ["disease with cellxgene datasets"],
      suspensionType: ["suspension type with cellxgene datasets"],
      tissue: ["tissue with cellxgene datasets"],
      title: "Component Atlas With CELLxGENE Datasets",
    },
    etag: "9e1b33020e807fd51b76d0891d5bdef4",
    eventTime: "2025-08-22T05:46:58.234Z",
    fileName: "component-atlas-with-cellxgene-datasets.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "5abfa948-624b-785f-e214-a3457816f20c",
    integrityCheckedAt: "2025-09-15T01:46:37.534Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "2789123",
    versionId: null,
  },
  id: "6feee158-5e54-4f46-8695-360c89ef9916",
  sourceDatasets: [
    SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
    SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAZ,
    SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
  ],
  versionId: "712e5187-20d2-4633-b206-f9f5a79085b0",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
    bucket: "bucket-entry-sheet-validations-foo",
    datasetInfo: {
      assay: ["assay with entry sheet validations foo"],
      cellCount: 45345,
      disease: ["disease with entry sheet validations foo"],
      suspensionType: ["suspension type with entry sheet validations foo"],
      tissue: ["tissue with entry sheet validations foo"],
      title: "Component Atlas With Entry Sheet Validations Foo",
    },
    etag: "0f2c44131f918ae62c87e1902e6cafe5",
    eventTime: "2025-08-22T05:47:21.456Z",
    fileName: "component-atlas-with-entry-sheet-validations-foo.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "6bcac059-735c-896a-f325-b4568927a31d",
    integrityCheckedAt: "2025-09-15T01:49:12.588Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "1654321",
    versionId: null,
  },
  id: "ea9f4b7a-a2a9-4fe8-a20a-5de4f11e60b8",
  sourceDatasets: [],
  versionId: "a7019e17-c7aa-4aaa-8740-d82f7c71e6ca",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
    bucket: "bucket-entry-sheet-validations-bar",
    datasetInfo: {
      assay: ["assay with entry sheet validations bar"],
      cellCount: 29348,
      disease: ["disease with entry sheet validations bar"],
      suspensionType: ["suspension type with entry sheet validations bar"],
      tissue: ["tissue with entry sheet validations bar"],
      title: "Component Atlas With Entry Sheet Validations Bar",
    },
    etag: "1a3d55242a029bf73d98f2013f7dbab6",
    eventTime: "2025-08-22T05:47:44.789Z",
    fileName: "component-atlas-with-entry-sheet-validations-bar.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "7cdbd160-846d-907b-a436-c5679038b42e",
    integrityCheckedAt: "2025-09-15T02:40:50.214Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    sizeBytes: "2123456",
    versionId: null,
  },
  id: "f3551bcf-31ae-4640-9bd5-68d8cdcb586b",
  sourceDatasets: [],
  versionId: "6de65567-692f-4a04-b792-e2ba6b500abb",
} satisfies TestComponentAtlas;

const BASE_FILE_COMPONENT_ATLAS_WITH_MULTIPLE_FILES = {
  atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  bucket: "bucket-with-multiple-files",
  datasetInfo: {
    assay: ["assay with multiple files"],
    cellCount: 43453,
    disease: ["disease with multiple files"],
    suspensionType: ["suspension type with multiple files"],
    tissue: ["tissue with multiple files"],
    title: "Component Atlas With Multiple Files",
  },
  fileName: "component-atlas-with-multiple-files.h5ad",
  fileType: FILE_TYPE.INTEGRATED_OBJECT,
  sizeBytes: "59456",
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_COMPONENT_ATLAS_WITH_MULTIPLE_FILES = {
  ...BASE_FILE_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  etag: "ba58c1a1fbea4a1086f7a0a767364cca",
  eventTime: "2025-09-16T02:59:48.485Z",
  id: "7e4b60ae-2d78-47ac-8e5c-83196047a7f3",
  integrityCheckedAt: "2025-09-16T03:00:11.886Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
} satisfies TestFile;
export const FILE_B_COMPONENT_ATLAS_WITH_MULTIPLE_FILES = {
  ...BASE_FILE_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  etag: "55bcb2de7f144a829bfcf3aa5712d47d",
  eventTime: "2025-09-16T03:00:35.982Z",
  id: "f1a1496f-4a00-43cc-881b-2b5e3360cc5d",
  integrityCheckedAt: "2025-09-16T03:00:55.834Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isArchived: true,
  isLatest: false,
} satisfies TestFile;
export const FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES = {
  ...BASE_FILE_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  etag: "0e1b0a46450b475b82d095265034bfeb",
  eventTime: "2025-09-16T03:01:23.949Z",
  id: "69586fc2-95d3-415e-b505-9d5768feb1bb",
  integrityCheckedAt: "2025-09-16T03:02:19.235Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
} satisfies TestFile;
export const COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES =
  "235920d2-b08b-408a-aa1a-9a1af9a98297";
export const COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W1 = {
  file: FILE_A_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  id: COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
  isLatest: false,
  sourceDatasets: [
    SOURCE_DATASET_ARCHIVED_FOO,
    SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  ],
  versionId: "6b3cbe31-093c-4053-8003-040bd86f9074",
  wipNumber: 1,
} satisfies TestComponentAtlas;
export const COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W2 = {
  file: FILE_B_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  id: COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
  isLatest: false,
  sourceDatasets: [
    SOURCE_DATASET_ARCHIVED_FOO,
    SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  ],
  versionId: "aeefc839-402d-462c-b1a8-c30e3cb8011c",
  wipNumber: 2,
} satisfies TestComponentAtlas;
export const COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3 = {
  file: FILE_C_COMPONENT_ATLAS_WITH_MULTIPLE_FILES,
  id: COMPONENT_ATLAS_ID_WITH_MULTIPLE_FILES,
  isLatest: true,
  sourceDatasets: [
    SOURCE_DATASET_ARCHIVED_FOO,
    SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  ],
  versionId: "b228f71b-2d2e-43a2-b126-f7b4e6b1db88",
  wipNumber: 3,
} satisfies TestComponentAtlas;

const BASE_FILE_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST = {
  atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  bucket: "bucket-with-archived-latest",
  datasetInfo: {
    assay: ["assay with archived latest"],
    cellCount: 64545,
    disease: ["disease with archived latest"],
    suspensionType: ["suspension type with archived latest"],
    tissue: ["tissue with archived latest"],
    title: "Component Atlas With Archived Latest",
  },
  fileName: "component-atlas-with-archived-latest.h5ad",
  fileType: FILE_TYPE.INTEGRATED_OBJECT,
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST = {
  ...BASE_FILE_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  etag: "915fbb243d774fc899765ac8d5aa0fac",
  eventTime: "2025-10-06T05:06:01.513Z",
  id: "d4912db6-52b5-4e27-9c7f-03f95cda5fcc",
  isArchived: false,
  isLatest: false,
  sizeBytes: "23423",
} satisfies TestFile;
export const FILE_B_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST = {
  ...BASE_FILE_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  etag: "1b32e22825854fed9b2f49cdaa88c7d5",
  eventTime: "2025-10-06T05:07:02.753Z",
  id: "68fbe660-dad6-4521-bbab-3fbf5191abab",
  isArchived: true,
  isLatest: true,
  sizeBytes: "64564",
} satisfies TestFile;
export const COMPONENT_ATLAS_ID_WITH_ARCHIVED_LATEST =
  "0b3a43c0-6871-4000-9351-d759f0cd78c8";
export const COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W1 = {
  file: FILE_A_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  id: COMPONENT_ATLAS_ID_WITH_ARCHIVED_LATEST,
  isLatest: false,
  sourceDatasets: [],
  versionId: "6a8f3af9-34c7-43c9-9042-ff0b106935b7",
  wipNumber: 1,
} satisfies TestComponentAtlas;
export const COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2 = {
  file: FILE_B_COMPONENT_ATLAS_WITH_ARCHIVED_LATEST,
  id: COMPONENT_ATLAS_ID_WITH_ARCHIVED_LATEST,
  isLatest: true,
  sourceDatasets: [],
  versionId: "ba6efd4b-7cab-464a-9700-32ce665c2dd6",
  wipNumber: 2,
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_ARCHIVED_FOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-archived-foo",
    datasetInfo: {
      assay: ["assay archived foo"],
      cellCount: 44328,
      disease: ["disease archived foo"],
      suspensionType: ["suspension type archived foo"],
      tissue: ["tissue archived foo"],
      title: "Component Atlas Archived Foo",
    },
    etag: "b1ba6db3229e4069b51f3415b4e7bbf6",
    eventTime: "2025-10-10T06:44:09.963Z",
    fileName: "component-atlas-archived-foo.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "e02c9a67-c1e7-42de-be6f-720fede81ca7",
    integrityCheckedAt: "2025-10-10T06:44:09.963Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "8453",
    versionId: null,
  },
  id: "45bf73f2-2f89-4fc4-b181-7b427414ff1e",
  sourceDatasets: [
    SOURCE_DATASET_ARCHIVED_FOO,
    SOURCE_DATASET_WITH_MULTIPLE_FILES_W3,
  ],
  versionId: "c0733faa-2227-43fc-94bd-d2f125d93b8a",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_ARCHIVED_BAR = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-archived-bar",
    datasetInfo: {
      assay: ["assay archived bar"],
      cellCount: 59807,
      disease: ["disease archived bar"],
      suspensionType: ["suspension type archived bar"],
      tissue: ["tissue archived bar"],
      title: "Component Atlas Archived Bar",
    },
    etag: "15030919f9364b7190a3720e238f0dfc",
    eventTime: "2025-10-10T06:44:53.413Z",
    fileName: "component-atlas-archived-bar.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "525f9f84-3f80-41f6-accc-56df7b99f544",
    integrityCheckedAt: "2025-10-10T06:44:53.413Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "48990",
    versionId: null,
  },
  id: "49571b1f-5059-4840-9e8c-37c5ea0e9e5b",
  sourceDatasets: [],
  versionId: "ed3af29f-ff6b-416c-ac95-977cf83436d4",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_ARCHIVED_BAZ = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-archived-baz",
    datasetInfo: {
      assay: ["assay archived baz"],
      cellCount: 40171,
      disease: ["disease archived baz"],
      suspensionType: ["suspension type archived baz"],
      tissue: ["tissue archived baz"],
      title: "Component Atlas Archived Baz",
    },
    etag: "4ca2dd77c5b14f0290a0f96c59104eb6",
    eventTime: "2025-10-10T06:45:16.510Z",
    fileName: "component-atlas-archived-baz.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "e21b5b76-1d13-410f-8b2c-82ad460e4a06",
    integrityCheckedAt: "2025-10-10T06:45:16.510Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "32940",
    versionId: null,
  },
  id: "46421b3a-3e5a-48a7-bb44-1f7c9295ec2e",
  sourceDatasets: [],
  versionId: "dc114d50-032b-4bfb-89f5-3d576b3abb0e",
} satisfies TestComponentAtlas;

export const COMPONENT_ATLAS_ARCHIVED_FOOFOO = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_B,
    bucket: "bucket-archived-foofoo",
    datasetInfo: {
      assay: ["assay archived foofoo"],
      cellCount: 60786,
      disease: ["disease archived foofoo"],
      suspensionType: ["suspension type archived foofoo"],
      tissue: ["tissue archived foofoo"],
      title: "Component Atlas Archived Foofoo",
    },
    etag: "7c7b48151ab7419da7f0a75513d60585",
    eventTime: "2025-10-10T07:15:18.716Z",
    fileName: "component-atlas-archived-foofoo.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "a992b714-690b-426a-9208-0a94daebba48",
    integrityCheckedAt: "2025-10-10T07:15:18.716Z",
    integrityStatus: INTEGRITY_STATUS.VALID,
    isArchived: true,
    sizeBytes: "29958",
    versionId: null,
  },
  id: "dd42e5b7-e829-45cb-8ea9-9286487d9ae0",
  sourceDatasets: [],
  versionId: "bb4a9576-b865-4beb-85a8-be77074c6353",
} satisfies TestComponentAtlas;

const BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO = {
  atlas: (): TestAtlas => ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  bucket: "bucket-non-latest-metadata-entities",
  datasetInfo: {
    assay: ["assay non latest metadata entities"],
    cellCount: 52341,
    disease: ["disease non latest metadata entities"],
    suspensionType: ["suspension type non latest metadata entities"],
    tissue: ["tissue non latest metadata entities"],
    title: "Component Atlas Non Latest Metadata Entities",
  },
  fileName: "component-atlas-non-latest-metadata-entities.h5ad",
  fileType: FILE_TYPE.INTEGRATED_OBJECT,
  sizeBytes: "71234",
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO = {
  ...BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO,
  etag: "a3c7d8e2f1b94a6583c2e7d9f0a1b3c5",
  eventTime: "2025-11-01T08:15:22.341Z",
  id: "8a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  integrityCheckedAt: "2025-11-01T08:15:45.672Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
} satisfies TestFile;
export const FILE_B_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO = {
  ...BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO,
  etag: "b4d8e9f3a2c5b7d6e8f0a1c3d5e7f9a2",
  eventTime: "2025-11-01T08:20:33.452Z",
  id: "9b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  integrityCheckedAt: "2025-11-01T08:20:58.123Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
} satisfies TestFile;
export const FILE_C_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO = {
  ...BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO,
  etag: "c5e9f0a4b3d6c8e7f9a2b4c6d8e0f1a3",
  eventTime: "2025-11-01T08:25:44.563Z",
  id: "0c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
  integrityCheckedAt: "2025-11-01T08:26:12.456Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
} satisfies TestFile;
export const COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO =
  "1d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a";
export const COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W1 = {
  file: FILE_A_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO,
  id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
  isLatest: false,
  sourceDatasets: [],
  versionId: "2e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
  wipNumber: 1,
} satisfies TestComponentAtlas;
export const COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2 = {
  file: FILE_B_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO,
  id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
  isLatest: false,
  sourceDatasets: [SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2],
  versionId: "3f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
  wipNumber: 2,
} satisfies TestComponentAtlas;
export const COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W3 = {
  file: FILE_C_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO,
  id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_FOO,
  isLatest: true,
  sourceDatasets: [
    SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2,
    SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W3,
  ],
  versionId: "4a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  wipNumber: 3,
} satisfies TestComponentAtlas;

const BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR = {
  atlas: (): TestAtlas => ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  bucket: "bucket-non-latest-metadata-entities-bar",
  datasetInfo: {
    assay: ["assay non latest metadata entities bar"],
    cellCount: 38492,
    disease: ["disease non latest metadata entities bar"],
    suspensionType: ["suspension type non latest metadata entities bar"],
    tissue: ["tissue non latest metadata entities bar"],
    title: "Component Atlas Non Latest Metadata Entities Bar",
  },
  fileName: "component-atlas-non-latest-metadata-entities-bar.h5ad",
  fileType: FILE_TYPE.INTEGRATED_OBJECT,
  sizeBytes: "48321",
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR = {
  ...BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR,
  etag: "d6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  eventTime: "2025-11-02T09:30:15.123Z",
  id: "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
  integrityCheckedAt: "2025-11-02T09:30:38.456Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
} satisfies TestFile;
export const FILE_B_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR = {
  ...BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR,
  etag: "e7f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
  eventTime: "2025-11-02T09:35:22.234Z",
  id: "6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e",
  integrityCheckedAt: "2025-11-02T09:35:45.567Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
} satisfies TestFile;
export const COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR =
  "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f";
export const COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W1 = {
  file: FILE_A_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR,
  id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR,
  isLatest: false,
  sourceDatasets: [],
  versionId: "8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
  wipNumber: 1,
} satisfies TestComponentAtlas;
export const COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2 = {
  file: FILE_B_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR,
  id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAR,
  isLatest: true,
  sourceDatasets: [SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2],
  versionId: "9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
  wipNumber: 2,
} satisfies TestComponentAtlas;

const BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ = {
  atlas: (): TestAtlas => ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
  bucket: "bucket-non-latest-metadata-entities-baz",
  datasetInfo: {
    assay: ["assay non latest metadata entities baz"],
    cellCount: 45678,
    disease: ["disease non latest metadata entities baz"],
    suspensionType: ["suspension type non latest metadata entities baz"],
    tissue: ["tissue non latest metadata entities baz"],
    title: "Component Atlas Non Latest Metadata Entities Baz",
  },
  fileName: "component-atlas-non-latest-metadata-entities-baz.h5ad",
  fileType: FILE_TYPE.INTEGRATED_OBJECT,
  sizeBytes: "55432",
  versionId: null,
} satisfies Partial<TestFile>;
export const FILE_A_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ = {
  ...BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ,
  etag: "f8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
  eventTime: "2025-11-03T10:45:30.345Z",
  id: "a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d",
  integrityCheckedAt: "2025-11-03T10:45:55.678Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
  isLatest: false,
} satisfies TestFile;
export const FILE_B_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ = {
  ...BASE_FILE_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ,
  etag: "a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
  eventTime: "2025-11-03T10:50:42.456Z",
  id: "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
  integrityCheckedAt: "2025-11-03T10:51:10.789Z",
  integrityStatus: INTEGRITY_STATUS.VALID,
} satisfies TestFile;
export const COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAZ =
  "c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f";
export const COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1 = {
  file: FILE_A_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ,
  id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
  isLatest: false,
  sourceDatasets: [],
  versionId: "d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a",
  wipNumber: 1,
} satisfies TestComponentAtlas;
export const COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W2 = {
  file: FILE_B_COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ,
  id: COMPONENT_ATLAS_ID_NON_LATEST_METADATA_ENTITIES_BAZ,
  isLatest: true,
  sourceDatasets: [],
  versionId: "e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b",
  wipNumber: 2,
} satisfies TestComponentAtlas;

const COMPONENT_ATLAS_ID_OUTDATED_FILENAME =
  "e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b";
export const COMPONENT_ATLAS_WITH_OUTDATED_FILENAME = {
  file: {
    atlas: (): TestAtlas => ATLAS_WITH_MISC_SOURCE_STUDIES_C,
    bucket: "bucket-with-outdated-filename",
    etag: "3a9f2b7e4c0d1e8f5a6b7c8d9e0f1a2b",
    eventTime: "2025-11-15T14:32:47.293Z",
    fileName: "component-atlas-with-outdated-filename-OUTDATED.h5ad",
    fileType: FILE_TYPE.INTEGRATED_OBJECT,
    id: "b5c6d7e8-f9a0-4b1c-9d2e-3f4a5b6c7d8e",
    sizeBytes: "63634",
    versionId: null,
  },
  id: COMPONENT_ATLAS_ID_OUTDATED_FILENAME,
  sourceDatasets: [],
  versionId: "c4d5e6f7-a8b9-4c0d-8e1f-2a3b4c5d6e7f",
  wipNumber: 5,
} satisfies TestComponentAtlas;

// Component atlases to initialize in the database before tests
export const INITIAL_TEST_COMPONENT_ATLASES: TestComponentAtlas[] = [
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_MISC_FOO,
  COMPONENT_ATLAS_MISC_BAR,
  COMPONENT_ATLAS_MISC_BAZ,
  COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS,
  COMPONENT_ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_FOO,
  COMPONENT_ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_BAR,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W1,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3,
  COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W2,
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W1,
  COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2,
  COMPONENT_ATLAS_ARCHIVED_FOO,
  COMPONENT_ATLAS_ARCHIVED_BAR,
  COMPONENT_ATLAS_ARCHIVED_BAZ,
  COMPONENT_ATLAS_ARCHIVED_FOOFOO,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W3,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1,
  COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W2,
  COMPONENT_ATLAS_WITH_OUTDATED_FILENAME,
];

// ATLASES

export const INTEGRATION_LEAD_BAZ = {
  email: "baz@example.com",
  name: "Baz",
};

export const INTEGRATION_LEAD_BAZ_BAZ = {
  email: "bazbaz@example.com",
  name: "Baz Baz",
};

export const ATLAS_DRAFT: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [
    COMPONENT_ATLAS_DRAFT_FOO.versionId,
    COMPONENT_ATLAS_DRAFT_BAR.versionId,
  ],
  description: "bar baz baz foo baz",
  generation: 1,
  highlights: "",
  id: ATLAS_ID_DRAFT,
  integrationLead: [
    {
      email: USER_INTEGRATION_LEAD_DRAFT.email,
      name: USER_INTEGRATION_LEAD_DRAFT.name,
    },
    {
      email: USER_INTEGRATION_LEAD_WITH_NEW_ATLAS.email,
      name: USER_INTEGRATION_LEAD_WITH_NEW_ATLAS.name,
    },
  ],
  network: "eye",
  publications: [],
  revision: 2,
  shortName: "test-draft",
  sourceDatasets: [
    SOURCE_DATASET_DRAFT_OK_FOO.versionId,
    SOURCE_DATASET_DRAFT_OK_BAR.versionId,
    SOURCE_DATASET_FOO.versionId,
    SOURCE_DATASET_BAR.versionId,
    SOURCE_DATASET_FOOFOO.versionId,
    SOURCE_DATASET_FOOBAR.versionId,
    SOURCE_DATASET_CELLXGENE_WITH_UPDATE.versionId,
  ],
  sourceStudies: [
    SOURCE_STUDY_DRAFT_OK.id,
    SOURCE_STUDY_SHARED.id,
    SOURCE_STUDY_DRAFT_NO_CROSSREF.id,
  ],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "1",
};

export const ATLAS_PUBLIC: TestAtlas = {
  cellxgeneAtlasCollection: "354564bb-52cb-4dea-8e2e-d3d707ca3b87",
  codeLinks: [{ label: "foo", url: "https://example.com/atlas-public-foo" }],
  componentAtlases: [],
  description: "foo foo bar bar foo",
  generation: 2,
  highlights: "bar foo baz foo foo bar baz",
  id: ATLAS_ID_PUBLIC,
  integrationLead: [
    {
      email: USER_INTEGRATION_LEAD_PUBLIC.email,
      name: USER_INTEGRATION_LEAD_PUBLIC.name,
    },
    {
      email: USER_INTEGRATION_LEAD_WITH_NEW_ATLAS.email,
      name: USER_INTEGRATION_LEAD_WITH_NEW_ATLAS.name,
    },
  ],
  metadataSpecificationUrl: "https://docs.google.com/spreadsheets/foo",
  network: "lung",
  publications: [],
  revision: 3,
  shortName: "test-public",
  sourceDatasets: [
    SOURCE_DATASET_FOOFOO.versionId,
    SOURCE_DATASET_FOOBAR.versionId,
  ],
  sourceStudies: [SOURCE_STUDY_PUBLIC_NO_CROSSREF.id, SOURCE_STUDY_SHARED.id],
  status: ATLAS_STATUS.OC_ENDORSED,
  targetCompletion: new Date("2024-05-28T22:31:45.731Z"),
  wave: "1",
};

export const ATLAS_WITH_IL: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "foo baz bar baz foo baz",
  generation: 2,
  highlights: "",
  id: "798b563d-16ff-438a-8e15-77be05b1f8ec",
  integrationLead: [INTEGRATION_LEAD_BAZ],
  network: "heart",
  publications: [],
  revision: 0,
  shortName: "test-with-il",
  sourceStudies: [SOURCE_STUDY_PUBLISHED_WITH_HCA.id],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "3",
};

export const ATLAS_WITH_MISC_SOURCE_STUDIES: TestAtlas = {
  cellxgeneAtlasCollection: "5aa910ee-23d7-419e-b2a4-8362dc058426",
  codeLinks: [
    { url: "https://example.com/atlas-with-misc-source-studies-foo" },
  ],
  componentAtlases: [
    COMPONENT_ATLAS_MISC_FOO.versionId,
    COMPONENT_ATLAS_MISC_BAR.versionId,
    COMPONENT_ATLAS_MISC_BAZ.versionId,
  ],
  description: "bar foo bar bar foo baz",
  generation: 2,
  highlights: "foo foo foo foo bar foo bar",
  id: ATLAS_ID_WITH_MISC_SOURCE_STUDIES,
  integrationLead: [INTEGRATION_LEAD_BAZ_BAZ],
  network: "adipose",
  publications: [{ doi: DOI_NORMAL, publication: PUBLICATION_NORMAL }],
  revision: 3,
  shortName: "test-with-misc-source-studies",
  sourceDatasets: [
    SOURCE_DATASET_FOO.versionId,
    SOURCE_DATASET_BAR.versionId,
    SOURCE_DATASET_BAZ.versionId,
    SOURCE_DATASET_FOOFOO.versionId,
    SOURCE_DATASET_FOOBAR.versionId,
    SOURCE_DATASET_FOOBAZ.versionId,
    SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.versionId,
    SOURCE_DATASET_CELLXGENE_WITH_UPDATE.versionId,
    SOURCE_DATASET_ATLAS_LINKED_A_FOO.versionId,
    SOURCE_DATASET_ATLAS_LINKED_A_BAR.versionId,
    SOURCE_DATASET_ATLAS_LINKED_B_FOO.versionId,
    SOURCE_DATASET_ATLAS_LINKED_B_BAR.versionId,
    SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO.versionId,
  ],
  sourceStudies: [
    SOURCE_STUDY_PUBLIC_WITH_JOURNAL.id,
    SOURCE_STUDY_PUBLIC_WITH_PREPRINT.id,
    SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
    SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS.id,
    SOURCE_STUDY_PUBLISHED_WITH_NEW_HCA_ID.id,
    SOURCE_STUDY_PUBLISHED_WITH_UPDATED_HCA_ID.id,
    SOURCE_STUDY_PUBLISHED_WITH_REMOVED_HCA_ID.id,
    SOURCE_STUDY_PUBLISHED_WITH_NEW_CELLXGENE_ID.id,
    SOURCE_STUDY_PUBLISHED_WITH_UPDATED_CELLXGENE_ID.id,
    SOURCE_STUDY_PUBLISHED_WITH_REMOVED_CELLXGENE_ID.id,
    SOURCE_STUDY_PUBLISHED_WITH_CHANGING_IDS.id,
    SOURCE_STUDY_UNPUBLISHED_WITH_HCA.id,
    SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS.id,
    SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID.id,
    SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id,
    SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_B.id,
  ],
  status: ATLAS_STATUS.OC_ENDORSED,
  wave: "2",
};

export const ATLAS_WITH_MISC_SOURCE_STUDIES_B: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [
    COMPONENT_ATLAS_WITH_MULTIPLE_FILES_W3.versionId,
    COMPONENT_ATLAS_WITH_ARCHIVED_LATEST_W2.versionId,
    COMPONENT_ATLAS_ARCHIVED_FOO.versionId,
    COMPONENT_ATLAS_ARCHIVED_BAR.versionId,
    COMPONENT_ATLAS_ARCHIVED_BAZ.versionId,
    COMPONENT_ATLAS_ARCHIVED_FOOFOO.versionId,
  ],
  description: "baz baz baz foo bar bar",
  generation: 5,
  highlights: "",
  id: ATLAS_ID_WITH_MISC_SOURCE_STUDIES_B,
  integrationLead: [],
  network: "eye",
  publications: [],
  revision: 3,
  shortName: "test-with-misc-source-studies-b",
  sourceDatasets: [
    SOURCE_DATASET_WITH_MULTIPLE_FILES_W3.versionId,
    SOURCE_DATASET_WITH_ARCHIVED_LATEST_W2.versionId,
    SOURCE_DATASET_ARCHIVED_FOO.versionId,
    SOURCE_DATASET_ARCHIVED_BAR.versionId,
    SOURCE_DATASET_ARCHIVED_BAZ.versionId,
    SOURCE_DATASET_ARCHIVED_FOOFOO.versionId,
    SOURCE_DATASET_ARCHIVED_FOOBAR.versionId,
  ],
  sourceStudies: [SOURCE_STUDY_WITH_ATLAS_LINKED_DATASETS_A.id],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "2",
};

export const ATLAS_WITH_MISC_SOURCE_STUDIES_C: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [COMPONENT_ATLAS_WITH_OUTDATED_FILENAME.versionId],
  description: "baz bar foo foo bar baz baz foo",
  generation: 6,
  highlights: "",
  id: ATLAS_ID_WITH_MISC_SOURCE_STUDIES_C,
  integrationLead: [],
  network: "lung",
  publications: [],
  revision: 2,
  shortName: "test-with-misc-source-studies-c",
  sourceDatasets: [
    SOURCE_DATASET_WITHOUT_SOURCE_STUDY_FOO.versionId,
    SOURCE_DATASET_WITHOUT_SOURCE_STUDY_BAR.versionId,
    SOURCE_DATASET_WITH_SOURCE_STUDY_FOO.versionId,
    SOURCE_DATASET_WITH_SOURCE_STUDY_BAR.versionId,
    SOURCE_DATASET_WITH_OUTDATED_FILENAME.versionId,
  ],
  sourceStudies: [SOURCE_STUDY_MISC_C_FOO.id, SOURCE_STUDY_MISC_C_BAR.id],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "1",
};

export const ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "foo baz baz bar foo bar",
  generation: 5,
  highlights: "",
  id: "7ce0814d-606c-475b-942a-0f72ff8c5c0b",
  integrationLead: [],
  network: "organoid",
  publications: [],
  revision: 4,
  shortName: ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_A,
  sourceStudies: [
    SOURCE_STUDY_PUBLISHED_WITH_HCA.id,
    SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_MISMATCH.id,
    SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH.id,
    SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA.id,
  ],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "2",
};

export const ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS.versionId],
  description: "baz foo baz foo bar bar foo",
  generation: 3,
  highlights: "",
  id: "9766683a-3c8d-4ec8-b8b5-3fceb8fe0d31",
  integrationLead: [],
  network: "gut",
  publications: [],
  revision: 5,
  shortName: "test-with-source-study-validations-b",
  sourceDatasets: [
    SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAZ.versionId,
    SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO.versionId,
  ],
  sourceStudies: [
    SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE.id,
  ],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "1",
};

export const ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_C: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "bar baz baz bar foo foo foo bar",
  generation: 6,
  highlights: "",
  id: "0e65d1fb-d352-4af4-8109-368935fd0c48",
  integrationLead: [],
  network: "organoid",
  publications: [],
  revision: 5,
  shortName: ATLAS_SHORT_NAME_WITH_SOURCE_STUDY_VALIDATIONS_C,
  sourceStudies: [SOURCE_STUDY_PUBLISHED_WITH_HCA_UNAVAILABLE_FOO.id],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "2",
};

export const ATLAS_PUBLIC_BAR: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "bar bar foo baz foo foo baz",
  generation: 7,
  highlights: "",
  id: "40cd10f3-021b-4472-9820-b49978fa6b58",
  integrationLead: [],
  network: "adipose",
  publications: [],
  revision: 2,
  shortName: "test-public-bar",
  sourceStudies: [],
  status: ATLAS_STATUS.OC_ENDORSED,
  wave: "3",
};

export const ATLAS_WITH_METADATA_CORRECTNESS: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "foo barbaz bazbar foo foo foobaz",
  generation: 2,
  highlights: "",
  id: "22d1ece3-9e62-42f5-a737-a9c84042a1a0",
  integrationLead: [],
  metadataCorrectnessUrl: "https://example.com/atlas-with-metadata-correctness",
  network: "reproduction",
  publications: [],
  revision: 6,
  shortName: "test-with-metadata-correctness",
  sourceDatasets: [],
  sourceStudies: [],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "3",
};

export const ATLAS_PUBLIC_BAZ: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "bar baz foo foo bar bar bar bar bar foo bar",
  generation: 5,
  highlights: "",
  id: "ca000a2b-8246-4694-8f21-f47bcbfe1852",
  integrationLead: [],
  network: "musculoskeletal",
  publications: [],
  revision: 2,
  shortName: "test-public-baz",
  sourceStudies: [],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "3",
};

export const ATLAS_WITH_CAP_ID: TestAtlas = {
  capId: "https://celltype.info/project/41866",
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "bar foo baz baz foo foo bar bar bar",
  generation: 6,
  highlights: "",
  id: "381ae4f6-7795-4084-9ce4-e2f5b0794c74",
  integrationLead: [],
  network: "heart",
  publications: [],
  revision: 2,
  shortName: "test-with-cap-id",
  sourceStudies: [],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "1",
};

export const ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [
    COMPONENT_ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_FOO.versionId,
    COMPONENT_ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_BAR.versionId,
  ],
  description: "foo baz baz foo bar baz baz bar foo bar",
  generation: 6,
  highlights: "",
  id: ATLAS_ID_WITH_ENTRY_SHEET_VALIDATIONS_A,
  integrationLead: [],
  network: "kidney",
  publications: [],
  revision: 7,
  shortName: "test-with-entry-sheet-validations-a",
  sourceStudies: [
    SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id,
    SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR.id,
  ],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "2",
};

export const ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_B: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "foo foo foo bar bar foo baz baz foo foo bar foo",
  generation: 5,
  highlights: "",
  id: "7cedbe48-2e45-4246-ba09-3a90c1f29275",
  integrationLead: [],
  network: "nervous-system",
  publications: [],
  revision: 0,
  shortName: "test-with-entry-sheet-validations-b",
  sourceStudies: [
    SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR.id,
    SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAZ.id,
  ],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "2",
};

export const ATLAS_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "baz bar baz bar foo bar baz foo foo bar baz",
  generation: 6,
  highlights: "",
  id: ATLAS_ID_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS,
  integrationLead: [],
  network: "lung",
  publications: [],
  revision: 1,
  shortName: "test-with-non-shared-entry-sheet-validations",
  sourceStudies: [SOURCE_STUDY_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS.id],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "1",
};

// Test atlas specifically for heatmap testing
export const ATLAS_HEATMAP_TEST: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [],
  description: "Test atlas for comprehensive heatmap testing",
  generation: 1,
  highlights: "",
  id: "16a9a162-cdf5-42cd-a84b-f5f49e9bea22",
  integrationLead: [],
  network: "eye",
  publications: [],
  revision: 0,
  shortName: "heatmap-test-atlas",
  sourceStudies: [
    SOURCE_STUDY_HEATMAP_TEST_FOO.id,
    SOURCE_STUDY_HEATMAP_TEST_BAR.id,
  ],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "1",
};

export const ATLAS_WITH_NON_LATEST_METADATA_ENTITIES: TestAtlas = {
  cellxgeneAtlasCollection: null,
  codeLinks: [],
  componentAtlases: [
    COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_FOO_W2.versionId,
    COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAR_W2.versionId,
    COMPONENT_ATLAS_NON_LATEST_METADATA_ENTITIES_BAZ_W1.versionId,
  ],
  description: "foo bar foobar barfoo foobarbar bazbarfoo",
  generation: 4,
  highlights: "",
  id: "e278426b-daaf-4f18-b204-081c90ebfe67",
  integrationLead: [],
  network: "reproduction",
  publications: [],
  revision: 1,
  shortName: "test-with-non-latest-metadata-entities",
  sourceDatasets: [
    SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_FOO_W2.versionId,
    SOURCE_DATASET_NON_LATEST_METADATA_ENTITIES_BAR_W2.versionId,
  ],
  sourceStudies: [SOURCE_STUDY_WITH_NON_LATEST_METADATA_ENTITIES.id],
  status: ATLAS_STATUS.IN_PROGRESS,
  wave: "2",
};

export const ATLAS_NONEXISTENT = {
  id: "aa992f01-39ea-4906-ac12-053552561187",
};

// Atlases initialized in the database before tests
export const INITIAL_TEST_ATLASES = [
  ATLAS_DRAFT,
  ATLAS_PUBLIC,
  ATLAS_WITH_IL,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  ATLAS_WITH_MISC_SOURCE_STUDIES_C,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_C,
  ATLAS_PUBLIC_BAR,
  ATLAS_WITH_METADATA_CORRECTNESS,
  ATLAS_PUBLIC_BAZ,
  ATLAS_WITH_CAP_ID,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_A,
  ATLAS_WITH_ENTRY_SHEET_VALIDATIONS_B,
  ATLAS_WITH_NON_SHARED_ENTRY_SHEET_VALIDATIONS,
  ATLAS_HEATMAP_TEST,
  ATLAS_WITH_NON_LATEST_METADATA_ENTITIES,
];

export const INITIAL_TEST_ATLASES_BY_SOURCE_STUDY = INITIAL_TEST_ATLASES.reduce(
  (atlasesByStudy, atlas) => {
    for (const studyId of atlas.sourceStudies) {
      (atlasesByStudy[studyId] || (atlasesByStudy[studyId] = [])).push(atlas);
    }
    return atlasesByStudy;
  },
  {} as Record<string, TestAtlas[]>,
);

// STANDALONE FILES

export const FILE_MANIFEST_FOO = {
  atlas: ATLAS_WITH_MISC_SOURCE_STUDIES,
  bucket: "bucket-foo",
  etag: "22826de20e224ffb82c58bfc1fd34710",
  eventTime: "2025-09-20T19:39:50.262Z",
  fileName: "manifest-foo.json",
  fileType: FILE_TYPE.INGEST_MANIFEST,
  id: "d56f249a-b60f-4b61-935e-345036e3e0ed",
  sizeBytes: "345",
  versionId: null,
} satisfies TestFile;

export const FILE_MANIFEST_BAR = {
  atlas: ATLAS_WITH_MISC_SOURCE_STUDIES,
  bucket: "bucket-bar",
  etag: "cc2a6d68bbd0421fb227441bf7e55da0",
  eventTime: "2025-09-20T19:43:54.367Z",
  fileName: "manifest-bar.json",
  fileType: FILE_TYPE.INGEST_MANIFEST,
  id: "1015617e-7309-472f-9a6d-5cda7d0b7529",
  sizeBytes: "235",
  versionId: null,
} satisfies TestFile;

export const FILE_MANIFEST_BAZ = {
  atlas: ATLAS_WITH_MISC_SOURCE_STUDIES,
  bucket: "bucket-baz",
  etag: "2ffdea9597dc4b40aa386c50a2506f40",
  eventTime: "2025-09-20T19:44:41.072Z",
  fileName: "manifest-baz.json",
  fileType: FILE_TYPE.INGEST_MANIFEST,
  id: "268a4a2a-a5ea-405c-b22f-28f7d4ea9731",
  sizeBytes: "342",
  versionId: null,
} satisfies TestFile;

export const INITIAL_STANDALONE_TEST_FILES: TestFile[] = [
  FILE_MANIFEST_FOO,
  FILE_MANIFEST_BAR,
  FILE_MANIFEST_BAZ,
];

// EXPLICITLY-DEFINED CONCEPTS

export const CONCEPT_COMPONENT_ATLAS_OUTDATED_FILENAME = {
  atlas: ATLAS_WITH_MISC_SOURCE_STUDIES_C,
  baseFilename: "component-atlas-with-outdated-filename-CURRENT.h5ad",
  fileType: FILE_TYPE.INTEGRATED_OBJECT,
  id: COMPONENT_ATLAS_ID_OUTDATED_FILENAME,
} satisfies TestConcept;

export const CONCEPT_SOURCE_DATASET_OUTDATED_FILENAME = {
  atlas: ATLAS_WITH_MISC_SOURCE_STUDIES_C,
  baseFilename: "source-dataset-with-outdated-filename-CURRENT.h5ad",
  fileType: FILE_TYPE.SOURCE_DATASET,
  id: SOURCE_DATASET_ID_OUTDATED_FILENAME,
} satisfies TestConcept;

export const INITIAL_EXPLICIT_TEST_CONCEPTS: TestConcept[] = [
  CONCEPT_COMPONENT_ATLAS_OUTDATED_FILENAME,
  CONCEPT_SOURCE_DATASET_OUTDATED_FILENAME,
];

// ENTRY SHEET VALIDATIONS

export const ENTRY_SHEET_VALIDATION_DRAFT_OK_FOO: TestEntrySheetValidation = {
  entry_sheet_id: ENTRY_SHEET_ID_DRAFT_OK_FOO,
  entry_sheet_title: ENTRY_SHEET_TITLE_DRAFT_OK_FOO,
  id: "aa8d5ffb-0fdc-4352-b35d-146fdb2c26ac",
  last_synced: new Date("2025-07-18T23:00:12.149Z"),
  last_updated: null,
  source_study_id: SOURCE_STUDY_DRAFT_OK.id,
  validation_report: [
    {
      cell: null,
      column: null,
      entity_type: null,
      input: null,
      message: "error foo foo",
      primary_key: null,
      row: null,
      worksheet_id: null,
    },
  ],
  validation_summary: {
    dataset_count: null,
    donor_count: null,
    error_count: 1,
    sample_count: null,
  },
};

export const ENTRY_SHEET_VALIDATION_DRAFT_OK_BAR: TestEntrySheetValidation = {
  entry_sheet_id: ENTRY_SHEET_ID_DRAFT_OK_BAR,
  entry_sheet_title: ENTRY_SHEET_TITLE_DRAFT_OK_BAR,
  id: "1a76610a-41ba-40c4-8413-c983e5cb4d3e",
  last_synced: new Date("2025-07-18T23:00:22.150Z"),
  last_updated: null,
  source_study_id: SOURCE_STUDY_DRAFT_OK.id,
  validation_report: [
    {
      cell: null,
      column: null,
      entity_type: null,
      input: null,
      message: "error foo bar",
      primary_key: null,
      row: null,
      worksheet_id: null,
    },
  ],
  validation_summary: {
    dataset_count: null,
    donor_count: null,
    error_count: 1,
    sample_count: null,
  },
};

export const ENTRY_SHEET_VALIDATION_WITH_UPDATE: TestEntrySheetValidation = {
  entry_sheet_id: ENTRY_SHEET_ID_WITH_UPDATE,
  entry_sheet_title: "Entry Sheet With Update",
  id: "4684a422-f3c5-4334-bc0a-df18a62bee0c",
  last_synced: new Date("2025-06-13T21:04:33.388Z"),
  last_updated: null,
  source_study_id: SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_FOO.id,
  validation_report: [
    {
      cell: null,
      column: null,
      entity_type: null,
      input: null,
      message: "error foo",
      primary_key: null,
      row: null,
      worksheet_id: null,
    },
  ],
  validation_summary: {
    dataset_count: null,
    donor_count: null,
    error_count: 1,
    sample_count: null,
  },
};

export const ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE: TestEntrySheetValidation =
  {
    entry_sheet_id: ENTRY_SHEET_ID_WITH_FAILED_UPDATE,
    entry_sheet_title: "Entry Sheet With Failed Update",
    id: "adac2d0c-34f3-404d-aa41-ddb0421bc722",
    last_synced: new Date("2025-06-15T01:14:11.075Z"),
    last_updated: {
      by: "bar",
      by_email: "bar@example.com",
      date: "2025-06-15T01:28:26.991Z",
    },
    source_study_id: SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR.id,
    validation_report: [],
    validation_summary: {
      dataset_count: 5,
      donor_count: 10,
      error_count: 0,
      sample_count: 30,
    },
  };

export const ENTRY_SHEET_VALIDATION_WITH_ERRORED_UPDATE: TestEntrySheetValidation =
  {
    entry_sheet_id: ENTRY_SHEET_ID_WITH_ERRORED_UPDATE,
    entry_sheet_title: "Entry Sheet With Errored Update",
    id: "9b3b1316-5e54-4391-8cf7-a388d40eca12",
    last_synced: new Date("2025-06-15T01:27:04.534Z"),
    last_updated: {
      by: "baz",
      by_email: "baz@example.com",
      date: "2025-06-15T01:29:46.048Z",
    },
    source_study_id: SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAR.id,
    validation_report: [],
    validation_summary: {
      dataset_count: 3,
      donor_count: 8,
      error_count: 0,
      sample_count: 14,
    },
  };

export const ENTRY_SHEET_VALIDATION_NO_SYNC: TestEntrySheetValidation = {
  entry_sheet_id: ENTRY_SHEET_ID_NO_SYNC,
  entry_sheet_title: "Entry Sheet No Sync",
  id: "68f048e7-563d-4ba4-be0a-7bad16499b8c",
  last_synced: new Date("2025-06-15T04:09:53.329Z"),
  last_updated: null,
  source_study_id: SOURCE_STUDY_WITH_ENTRY_SHEET_VALIDATIONS_BAZ.id,
  validation_report: [
    {
      cell: null,
      column: null,
      entity_type: null,
      input: null,
      message: "error bar",
      primary_key: null,
      row: null,
      worksheet_id: null,
    },
  ],
  validation_summary: {
    dataset_count: null,
    donor_count: null,
    error_count: 1,
    sample_count: null,
  },
};

// Test entry sheet validation with complete data and mixed error patterns
export const ENTRY_SHEET_VALIDATION_HEATMAP_COMPLETE = {
  entry_sheet_id: "1gylPiLAob4PK7FtcSXXaWX9SzW8dj-iOCkB9pW6Wj5M",
  entry_sheet_title: "Complete Heatmap Test Sheet",
  id: "e50b3db4-031e-4f3f-9876-83dc398f6286",
  last_synced: new Date("2024-01-15T10:00:00Z"),
  last_updated: {
    by: "test-user",
    by_email: "test@example.com",
    date: "2024-01-15T09:30:00Z",
  },
  source_study_id: SOURCE_STUDY_HEATMAP_TEST_FOO.id,
  validation_report: [
    // Cell-specific errors for different entity types
    {
      cell: "A2",
      column: "dataset_id",
      entity_type: "dataset",
      input: "invalid-id",
      message: "Invalid dataset ID format",
      primary_key: "dataset_id",
      row: 1,
      worksheet_id: 0,
    },
    {
      cell: "B3",
      column: "organism_ontology_term_id",
      entity_type: "donor",
      input: "invalid-organism",
      message: "Invalid organism ontology term ID",
      primary_key: "donor_id",
      row: 2,
      worksheet_id: 1,
    },
    {
      cell: "C4",
      column: "tissue_ontology_term_id",
      entity_type: "sample",
      input: null,
      message: "Missing required tissue ontology term ID",
      primary_key: "sample_id",
      row: 3,
      worksheet_id: 2,
    },
    // Column-wide error (cell: null)
    {
      cell: null,
      column: "title",
      entity_type: "dataset",
      input: null,
      message: "Missing title",
      primary_key: null,
      row: null,
      worksheet_id: 0,
    },
    // Duplicate cell error (should only count once)
    {
      cell: "A2",
      column: "dataset_id",
      entity_type: "dataset",
      input: "invalid-id",
      message: "Duplicate error for same cell",
      primary_key: "dataset_id",
      row: 1,
      worksheet_id: 0,
    },
    // Irrelevant errors that should be ignored
    {
      cell: "D5",
      column: null, // No column - should be ignored
      entity_type: "dataset",
      input: "some-value-foo",
      message: "Error with no column",
      primary_key: "dataset_id",
      row: 4,
      worksheet_id: 0,
    },
    {
      cell: null,
      column: null,
      entity_type: null, // No entity type - should be ignored
      input: null,
      message: "Error without entity type",
      primary_key: null,
      row: null,
      worksheet_id: null,
    },
    {
      cell: "F7",
      column: "nonexistent_field", // Non-existent column - should be ignored
      entity_type: "dataset",
      input: "some-value-baz",
      message: "Error for non-existent field",
      primary_key: "dataset_id",
      row: 6,
      worksheet_id: 0,
    },
  ],
  validation_summary: {
    dataset_count: 10,
    donor_count: 5,
    error_count: 8,
    sample_count: 15,
  },
} satisfies TestEntrySheetValidation;

// Test entry sheet validation with missing title and partial data
export const ENTRY_SHEET_VALIDATION_HEATMAP_PARTIAL = {
  entry_sheet_id: "1GFtQ77wyASnRaONdiAflm6mW7thXVATdngN2rLxuaFW",
  entry_sheet_title: null, // No title - should fall back to ID
  id: "bb22f192-73a5-4492-9895-d6fce4588513",
  last_synced: new Date("2024-01-16T11:00:00Z"),
  last_updated: {
    by: "test-user-2",
    by_email: "test2@example.com",
    date: "2024-01-16T10:30:00Z",
  },
  source_study_id: SOURCE_STUDY_HEATMAP_TEST_FOO.id,
  validation_report: [
    // Two errors in different cells in the same column
    {
      cell: "A2",
      column: "organism_ontology_term_id",
      entity_type: "donor",
      input: "invalid-organism",
      message: "Invalid organism ontology term ID",
      primary_key: "donor_id",
      row: 1,
      worksheet_id: 1,
    },
    {
      cell: "A3",
      column: "organism_ontology_term_id",
      entity_type: "donor",
      input: null,
      message: "Missing required organism ontology term ID",
      primary_key: "donor_id",
      row: 2,
      worksheet_id: 1,
    },
    // This error should be ignored because dataset_count is null
    {
      cell: "B3",
      column: "dataset_id",
      entity_type: "dataset",
      input: "some-id",
      message: "Dataset error (should be ignored)",
      primary_key: "dataset_id",
      row: 2,
      worksheet_id: 0,
    },
  ],
  validation_summary: {
    dataset_count: null, // No dataset data
    donor_count: 3, // Has donor data
    error_count: 2,
    sample_count: null, // No sample data
  },
} satisfies TestEntrySheetValidation;

// Test entry sheet validation with no data (all null counts)
export const ENTRY_SHEET_VALIDATION_HEATMAP_EMPTY = {
  entry_sheet_id: "17gay2myiOJryicniEHDHra3kGxL5Ps6V0Tvx9LxjGku",
  entry_sheet_title: "Empty Heatmap Test Sheet",
  id: "38c1880a-2b0a-49df-8879-b9fc9879869e",
  last_synced: new Date("2024-01-17T12:00:00Z"),
  last_updated: null,
  source_study_id: SOURCE_STUDY_HEATMAP_TEST_BAR.id,
  validation_report: [],
  validation_summary: {
    dataset_count: null,
    donor_count: null,
    error_count: 0,
    sample_count: null,
  },
} satisfies TestEntrySheetValidation;

// Test entry sheet validation with perfect data (no errors)
export const ENTRY_SHEET_VALIDATION_HEATMAP_PERFECT = {
  entry_sheet_id: "1xZPXuQ9UqY7JO2uUj+G6/uboUht2jI7rqt1bJ/Cnpc1",
  entry_sheet_title: "Perfect Heatmap Test Sheet",
  id: "7a6414b4-7269-455d-8b0f-9dfec214d1f3",
  last_synced: new Date("2024-01-18T13:00:00Z"),
  last_updated: {
    by: "perfect-user",
    by_email: "perfect@example.com",
    date: "2024-01-18T12:30:00Z",
  },
  source_study_id: SOURCE_STUDY_HEATMAP_TEST_BAR.id,
  validation_report: [], // No errors
  validation_summary: {
    dataset_count: 5,
    donor_count: 3,
    error_count: 0,
    sample_count: 8,
  },
} satisfies TestEntrySheetValidation;

export const INITIAL_TEST_ENTRY_SHEET_VALIDATIONS = [
  ENTRY_SHEET_VALIDATION_DRAFT_OK_FOO,
  ENTRY_SHEET_VALIDATION_DRAFT_OK_BAR,
  ENTRY_SHEET_VALIDATION_WITH_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_FAILED_UPDATE,
  ENTRY_SHEET_VALIDATION_WITH_ERRORED_UPDATE,
  ENTRY_SHEET_VALIDATION_NO_SYNC,
  ENTRY_SHEET_VALIDATION_HEATMAP_COMPLETE,
  ENTRY_SHEET_VALIDATION_HEATMAP_PARTIAL,
  ENTRY_SHEET_VALIDATION_HEATMAP_EMPTY,
  ENTRY_SHEET_VALIDATION_HEATMAP_PERFECT,
];

// COMMENTS

export const THREAD_ID_BY_STAKEHOLDER = "5eaf0a40-e603-46d6-b38d-45f0f1664295";

export const THREAD_ID_BY_CONTENT_ADMIN =
  "48cb0273-7a3b-449b-9f61-5418be01d6cf";

export const THREAD_ID_BY_STAKEHOLDER_FOO =
  "590f3a6a-68d8-457d-a6a2-c43b26a083be";

export const THREAD_ID_BY_CONTENT_ADMIN_FOO =
  "2bf5ac46-4e9e-4b5d-b507-9cd3103cf7f8";

export const THREAD_ID_BY_STAKEHOLDER2 = "3e5a735e-b055-410d-a8d4-5ce9ef64352d";

export const THREAD_ID_BY_CELLXGENE_ADMIN =
  "279a2806-63bb-4b46-9045-6a0d01abf794";

export const COMMENT_BY_STAKEHOLDER_ROOT: TestComment = {
  createdAt: "2024-06-25T21:13:49.725Z",
  createdBy: USER_STAKEHOLDER,
  id: "9b0a28a3-1fed-4f02-9850-39d60e2d88b2",
  text: "foo barfoo baz",
  threadId: THREAD_ID_BY_STAKEHOLDER,
};

export const COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER: TestComment = {
  createdAt: "2024-06-25T21:14:11.153Z",
  createdBy: USER_STAKEHOLDER,
  id: "9925b9ab-2e4c-45c5-b0b0-40dd0043f0f3",
  text: "barbar foo baz foo",
  threadId: THREAD_ID_BY_STAKEHOLDER,
};

export const COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN: TestComment = {
  createdAt: "2024-06-25T21:15:24.460Z",
  createdBy: USER_CONTENT_ADMIN,
  id: "816e4a41-cc56-4232-9bf7-35401b91370c",
  text: "foo baz bar bazbaz",
  threadId: THREAD_ID_BY_STAKEHOLDER,
};

export const COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT: TestComment =
  {
    createdAt: "2024-06-30T04:03:41.350Z",
    createdBy: USER_INTEGRATION_LEAD_DRAFT,
    id: "9ba92533-a53d-4683-8117-d4ccf0164215",
    text: "bar barbar baz foo",
    threadId: THREAD_ID_BY_STAKEHOLDER,
  };

export const COMMENT_BY_CONTENT_ADMIN_ROOT: TestComment = {
  createdAt: "2024-06-26T05:17:42.555Z",
  createdBy: USER_CONTENT_ADMIN,
  id: "ce7437eb-db21-497a-b1d3-cef333097b8c",
  text: "bar foobar barbazbaz",
  threadId: THREAD_ID_BY_CONTENT_ADMIN,
};

export const COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER: TestComment = {
  createdAt: "2024-06-26T05:18:29.875Z",
  createdBy: USER_STAKEHOLDER,
  id: "f031b429-0234-4798-aaaf-2a5743e30c17",
  text: "barfoofoo foobar baz foo",
  threadId: THREAD_ID_BY_CONTENT_ADMIN,
};

export const COMMENT_BY_CONTENT_ADMIN_REPLY2_ADMIN: TestComment = {
  createdAt: "2024-06-26T05:19:13.480Z",
  createdBy: USER_CONTENT_ADMIN,
  id: "7c6b6e70-883f-4256-8b94-3c4fc863fdb2",
  text: "baz foofoo foo",
  threadId: THREAD_ID_BY_CONTENT_ADMIN,
};

export const COMMENT_BY_STAKEHOLDER_FOO_ROOT: TestComment = {
  createdAt: "2024-06-26T19:59:13.734Z",
  createdBy: USER_STAKEHOLDER,
  id: "54c3ecdb-63b0-49eb-ba70-e06e7fe4817f",
  text: "baz foobaz bazbar",
  threadId: THREAD_ID_BY_STAKEHOLDER_FOO,
};

export const COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN: TestComment = {
  createdAt: "2024-06-26T19:59:54.303Z",
  createdBy: USER_CONTENT_ADMIN,
  id: "2a748245-08bb-4ddb-adf5-1514ec915eb3",
  text: "foobar foo bar baz",
  threadId: THREAD_ID_BY_STAKEHOLDER_FOO,
};

export const COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2: TestComment = {
  createdAt: "2024-06-26T20:00:28.019Z",
  createdBy: USER_STAKEHOLDER2,
  id: "0a1203c3-0b03-46f1-b55d-8309e21b3581",
  text: "barfoo foobarbaz bazbar",
  threadId: THREAD_ID_BY_STAKEHOLDER_FOO,
};

export const COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT: TestComment =
  {
    createdAt: "2024-06-30T04:11:49.751Z",
    createdBy: USER_INTEGRATION_LEAD_DRAFT,
    id: "549d81db-7b54-43d8-bea7-28fe15401161",
    text: "foobaz baz foo baz",
    threadId: THREAD_ID_BY_STAKEHOLDER_FOO,
  };

export const COMMENT_BY_CONTENT_ADMIN_FOO_ROOT: TestComment = {
  createdAt: "2024-06-26T20:01:05.629Z",
  createdBy: USER_CONTENT_ADMIN,
  id: "a9f4ac87-4760-49d2-bafb-a86c245e0772",
  text: "baz baz foo barfoo",
  threadId: THREAD_ID_BY_CONTENT_ADMIN_FOO,
};

export const COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER: TestComment = {
  createdAt: "2024-06-26T20:01:38.746Z",
  createdBy: USER_STAKEHOLDER,
  id: "c0c4f831-d5d1-4020-b778-75208a88b150",
  text: "barfoofoo foo",
  threadId: THREAD_ID_BY_CONTENT_ADMIN_FOO,
};

export const COMMENT_BY_CONTENT_ADMIN_FOO_REPLY2_STAKEHOLDER2: TestComment = {
  createdAt: "2024-06-26T20:02:15.665Z",
  createdBy: USER_STAKEHOLDER2,
  id: "30353723-cf92-4262-a73b-b3fc02993de5",
  text: "baz foo barbar",
  threadId: THREAD_ID_BY_CONTENT_ADMIN_FOO,
};

export const COMMENT_BY_STAKEHOLDER2_ROOT: TestComment = {
  createdAt: "2024-06-26T20:02:45.374Z",
  createdBy: USER_STAKEHOLDER2,
  id: "eed98c8d-bc18-4f9c-88c4-41086c11b85a",
  text: "baz barfoo bar barbar",
  threadId: THREAD_ID_BY_STAKEHOLDER2,
};

export const COMMENT_BY_STAKEHOLDER2_REPLY1_ADMIN: TestComment = {
  createdAt: "2024-06-26T20:03:28.628Z",
  createdBy: USER_CONTENT_ADMIN,
  id: "48056eb8-e6c5-4e95-9abb-3f9824af758a",
  text: "foo barbazfoo bar",
  threadId: THREAD_ID_BY_STAKEHOLDER2,
};

export const COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER: TestComment = {
  createdAt: "2024-06-26T20:04:03.038Z",
  createdBy: USER_STAKEHOLDER,
  id: "0b55a00a-aede-455f-97be-0f948fd43a81",
  text: "bar foo foo barfoo",
  threadId: THREAD_ID_BY_STAKEHOLDER2,
};

export const COMMENT_BY_STAKEHOLDER2_REPLY3_CELLXGENE_ADMIN: TestComment = {
  createdAt: "2024-07-17T02:09:52.948Z",
  createdBy: USER_CELLXGENE_ADMIN,
  id: "c659e9d4-f057-474a-8f77-217892975542",
  text: "foobaz barbaz foofoo",
  threadId: THREAD_ID_BY_STAKEHOLDER2,
};

export const COMMENT_BY_CELLXGENE_ADMIN_ROOT: TestComment = {
  createdAt: "2024-07-17T01:52:51.799Z",
  createdBy: USER_CELLXGENE_ADMIN,
  id: "c39eb054-57db-439f-9e31-9a7dbcc2107b",
  text: "foo barfoobar bar",
  threadId: THREAD_ID_BY_CELLXGENE_ADMIN,
};

export const COMMENT_BY_CELLXGENE_ADMIN_REPLY1_INTEGRATION_LEAD_DRAFT: TestComment =
  {
    createdAt: "2024-07-17T01:53:07.699Z",
    createdBy: USER_INTEGRATION_LEAD_DRAFT,
    id: "1dd6eb4f-5b0c-44a3-8a0b-8114fcb4d0f9",
    text: "bazbar baz foo bar",
    threadId: THREAD_ID_BY_CELLXGENE_ADMIN,
  };

export const COMMENT_BY_CELLXGENE_ADMIN_REPLY2_CELLXGENE_ADMIN: TestComment = {
  createdAt: "2024-07-17T01:53:20.699Z",
  createdBy: USER_CELLXGENE_ADMIN,
  id: "77e58bdd-90b4-4005-b450-27dab32c2b37",
  text: "foo bazbazbaz bar foobar",
  threadId: THREAD_ID_BY_CELLXGENE_ADMIN,
};

// Comments to initialize in the database before tests
export const INITIAL_TEST_COMMENTS = [
  COMMENT_BY_STAKEHOLDER_ROOT,
  COMMENT_BY_STAKEHOLDER_REPLY1_STAKEHOLDER,
  COMMENT_BY_STAKEHOLDER_REPLY2_ADMIN,
  COMMENT_BY_STAKEHOLDER_REPLY3_INTEGRATION_LEAD_DRAFT,
  COMMENT_BY_CONTENT_ADMIN_ROOT,
  COMMENT_BY_CONTENT_ADMIN_REPLY1_STAKEHOLDER,
  COMMENT_BY_CONTENT_ADMIN_REPLY2_ADMIN,
  COMMENT_BY_STAKEHOLDER_FOO_ROOT,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY1_ADMIN,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY2_STAKEHOLDER2,
  COMMENT_BY_STAKEHOLDER_FOO_REPLY3_INTEGRATION_LEAD_DRAFT,
  COMMENT_BY_CONTENT_ADMIN_FOO_ROOT,
  COMMENT_BY_CONTENT_ADMIN_FOO_REPLY1_STAKEHOLDER,
  COMMENT_BY_CONTENT_ADMIN_FOO_REPLY2_STAKEHOLDER2,
  COMMENT_BY_STAKEHOLDER2_ROOT,
  COMMENT_BY_STAKEHOLDER2_REPLY1_ADMIN,
  COMMENT_BY_STAKEHOLDER2_REPLY2_STAKEHOLDER,
  COMMENT_BY_STAKEHOLDER2_REPLY3_CELLXGENE_ADMIN,
  COMMENT_BY_CELLXGENE_ADMIN_ROOT,
  COMMENT_BY_CELLXGENE_ADMIN_REPLY1_INTEGRATION_LEAD_DRAFT,
  COMMENT_BY_CELLXGENE_ADMIN_REPLY2_CELLXGENE_ADMIN,
];

export const TEST_COMMENTS = [...INITIAL_TEST_COMMENTS];

export const TEST_COMMENTS_BY_THREAD_ID = TEST_COMMENTS.reduce(
  (byThread, comment) => {
    (byThread[comment.threadId] || (byThread[comment.threadId] = [])).push(
      comment,
    );
    return byThread;
  },
  {} as Record<string, TestComment[]>,
);

// Google sheets

export const TEST_UNSHARED_GOOGLE_SHEET_IDS = new Set(["sheet-unshared"]);

export const TEST_GOOGLE_SHEET_TITLES_BY_ID: Record<string, string> = {
  [ENTRY_SHEET_ID_DRAFT_OK_BAR]: ENTRY_SHEET_TITLE_DRAFT_OK_BAR,
  [ENTRY_SHEET_ID_DRAFT_OK_FOO]: ENTRY_SHEET_TITLE_DRAFT_OK_FOO,
  "atlas-public-baz": "Atlas Public Baz Sheet",
  "new-atlas-with-metadata-specification":
    "New Atlas With Metadata Specification Sheet",
  "sheet-bar": "Sheet Bar",
  "sheet-baz": "Sheet Baz",
  "sheet-foo": "Sheet Foo",
};
