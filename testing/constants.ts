import { ProjectsResponse } from "app/apis/azul/hca-dcp/common/responses";
import {
  ATLAS_STATUS,
  DOI_STATUS,
  PublicationInfo,
  ROLE,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  CellxGeneCollection,
  CellxGeneDataset,
} from "../app/utils/cellxgene-api";
import { CrossrefWork } from "../app/utils/crossref/crossref";
import {
  TestAtlas,
  TestComment,
  TestComponentAtlas,
  TestPublishedSourceStudy,
  TestSourceDataset,
  TestUnpublishedSourceStudy,
  TestUser,
} from "./entities";
import { makeTestProjectsResponse, makeTestUser } from "./utils";

export const STAKEHOLDER_ANALOGOUS_ROLES = [
  ROLE.STAKEHOLDER,
  ROLE.INTEGRATION_LEAD,
  ROLE.CELLXGENE_ADMIN,
];

export const STAKEHOLDER_ANALOGOUS_ROLES_WITHOUT_INTEGRATION_LEAD =
  STAKEHOLDER_ANALOGOUS_ROLES.filter((r) => r !== ROLE.INTEGRATION_LEAD);

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

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
    DOI_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
    "Published – With     Hca Title <i>Near</i> Match. "
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    DOI_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
    "Published With No HCA Primary Data",
    []
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UNCHANGING_IDS =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_UNCHANGING_IDS,
    DOI_PUBLISHED_WITH_UNCHANGING_IDS,
    PUBLICATION_PUBLISHED_WITH_UNCHANGING_IDS.title
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NEW_HCA_ID =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_NEW_HCA_ID,
    DOI_PUBLISHED_WITH_NEW_HCA_ID,
    "Published With New HCA ID"
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UPDATED_HCA_ID =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_B,
    DOI_PUBLISHED_WITH_UPDATED_HCA_ID,
    "Published With Updated HCA ID"
  );

export const HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_CHANGING_IDS =
  makeTestProjectsResponse(
    HCA_ID_PUBLISHED_WITH_CHANGING_IDS,
    DOI_PUBLISHED_WITH_CHANGING_IDS,
    "Published With "
  );

export const TEST_HCA_PROJECTS = [
  HCA_PROJECTS_RESPONSE_NORMAL,
  HCA_PROJECTS_RESPONSE_JOURNAL_COUNTERPART,
  HCA_PROJECTS_RESPONSE_PREPRINT_COUNTERPART,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_MISMATCH,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UNCHANGING_IDS,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_NEW_HCA_ID,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_UPDATED_HCA_ID,
  HCA_PROJECTS_RESPONSE_PUBLISHED_WITH_CHANGING_IDS,
];

export const TEST_HCA_PROJECTS_BY_DOI = new Map(
  TEST_HCA_PROJECTS.map((projectsResponse) => [
    projectsResponse.projects[0].publications[0].doi,
    projectsResponse,
  ])
);

export const TEST_HCA_PROJECTS_BY_ID = new Map(
  TEST_HCA_PROJECTS.map((projectsResponse) => [
    projectsResponse.projects[0].projectId,
    projectsResponse,
  ])
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

export const CELLXGENE_DATASET_WITHOUT_UPDATE: CellxGeneDataset = {
  assay: [{ label: "foo" }],
  cell_count: 123,
  collection_id: CELLXGENE_ID_WITH_SOURCE_DATASETS,
  dataset_id: CELLXGENE_ID_DATASET_WITHOUT_UPDATE,
  dataset_version_id: CELLXGENE_VERSION_DATASET_WITHOUT_UPDATE,
  disease: [{ label: "bar" }],
  explorer_url: "explorer-url-cellxgene-dataset-without-update",
  suspension_type: ["foobarbaz"],
  tissue: [{ label: "baz" }],
  title: "Dataset Without Update",
};

export const CELLXGENE_DATASET_WITH_UPDATE_UPDATED: CellxGeneDataset = {
  assay: [{ label: "foobar" }],
  cell_count: 456,
  collection_id: CELLXGENE_ID_WITH_SOURCE_DATASETS,
  dataset_id: CELLXGENE_ID_DATASET_WITH_UPDATE,
  dataset_version_id: "cellxgene-version-dataset-with-update-b",
  disease: [{ label: "barbar" }],
  explorer_url: "explorer-url-cellxgene-dataset-with-update",
  suspension_type: ["foobazbar"],
  tissue: [{ label: "bazbar" }],
  title: "Dataset With Update Updated",
};

export const CELLXGENE_DATASET_NEW: CellxGeneDataset = {
  assay: [{ label: "foobaz" }],
  cell_count: 789,
  collection_id: CELLXGENE_ID_WITH_SOURCE_DATASETS,
  dataset_id: CELLXGENE_ID_DATASET_NEW,
  dataset_version_id: "cellxgene-version-dataset-new",
  disease: [{ label: "barbaz" }],
  explorer_url: "explorer-url-cellxgene-dataset-new",
  suspension_type: ["bazfoobar"],
  tissue: [{ label: "bazbaz" }],
  title: "Dataset New",
};

export const CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO: CellxGeneDataset =
  {
    assay: [{ label: "barfoo" }],
    cell_count: 100,
    collection_id: CELLXGENE_ID_WITH_NEW_SOURCE_DATASETS,
    dataset_id: "cellxgene-dataset-with-new-source-datasets-foo",
    dataset_version_id: "cellxgene-version-with-new-source-datasets-foo",
    disease: [{ label: "bazfoo" }],
    explorer_url: "explorer-url-cellxgene-dataset-with-new-source-datasets-foo",
    suspension_type: ["bazbarfoo"],
    tissue: [{ label: "foofoo" }],
    title: "Dataset With New Source Datasets Foo",
  };

export const CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR: CellxGeneDataset =
  {
    assay: [{ label: "bazfoo" }],
    cell_count: 200,
    collection_id: CELLXGENE_ID_WITH_NEW_SOURCE_DATASETS,
    dataset_id: "cellxgene-dataset-with-new-source-datasets-bar",
    dataset_version_id: "cellxgene-version-with-new-source-datasets-bar",
    disease: [{ label: "foobaz" }],
    explorer_url: "explorer-url-cellxgene-dataset-with-new-source-datasets-bar",
    suspension_type: ["barbazfoo"],
    tissue: [{ label: "foofoo" }],
    title: "Dataset With New Source Datasets Bar",
  };

export const CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO: CellxGeneDataset =
  {
    assay: [{ label: "assay unpublished with cellxgene foo" }],
    cell_count: 5464,
    collection_id: CELLXGENE_ID_UNPUBLISHED_WITH_CELLXGENE,
    dataset_id: CELLXGENE_ID_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
    dataset_version_id:
      CELLXGENE_VERSION_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
    disease: [{ label: "disease unpublished with cellxgene foo" }],
    explorer_url:
      "explorer-url-cellxgene-dataset-unpublished-with-cellxgene-foo",
    suspension_type: ["suspension type unpublished with cellxgene foo"],
    tissue: [{ label: "tissue unpublished with cellxgene foo" }],
    title: "Source Dataset Unpublished With CELLxGENE Foo",
  };

export const CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR: CellxGeneDataset =
  {
    assay: [{ label: "assay unpublished with cellxgene bar" }],
    cell_count: 3493,
    collection_id: CELLXGENE_ID_UNPUBLISHED_WITH_CELLXGENE,
    dataset_id: CELLXGENE_ID_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
    dataset_version_id:
      CELLXGENE_VERSION_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
    disease: [{ label: "disease unpublished with cellxgene bar" }],
    explorer_url:
      "explorer-url-cellxgene-dataset-unpublished-with-cellxgene-bar",
    suspension_type: ["suspension type unpublished with cellxgene bar"],
    tissue: [{ label: "tissue unpublished with cellxgene bar" }],
    title: "Source Dataset Unpublished With CELLxGENE Bar",
  };

export const CELLXGENE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO: CellxGeneDataset =
  {
    assay: [{ label: "assay published without cellxgene id foo" }],
    cell_count: 34538,
    collection_id: CELLXGENE_ID_PUBLISHED_WITHOUT_CELLXGENE_ID,
    dataset_id: CELLXGENE_ID_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
    dataset_version_id:
      CELLXGENE_VERSION_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
    disease: [{ label: "disease published without cellxgene id foo" }],
    explorer_url:
      "exporer-url-cellxgene-dataset-published-without-cellxgene-id-foo",
    suspension_type: ["suspension type published without cellxgene id foo"],
    tissue: [{ label: "tissue published without cellxgene id foo" }],
    title: "Source Dataset Published Without CELLxGENE ID Foo",
  };

export const TEST_CELLXGENE_DATASETS_BY_COLLECTION_ID = new Map([
  [
    CELLXGENE_ID_WITH_SOURCE_DATASETS,
    [
      CELLXGENE_DATASET_WITHOUT_UPDATE,
      CELLXGENE_DATASET_WITH_UPDATE_UPDATED,
      CELLXGENE_DATASET_NEW,
    ],
  ],
  [
    CELLXGENE_ID_WITH_NEW_SOURCE_DATASETS,
    [
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_FOO,
      CELLXGENE_DATASET_WITH_NEW_SOURCE_DATASETS_BAR,
    ],
  ],
  [
    CELLXGENE_ID_UNPUBLISHED_WITH_CELLXGENE,
    [
      CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
      CELLXGENE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
    ],
  ],
  [
    CELLXGENE_ID_PUBLISHED_WITHOUT_CELLXGENE_ID,
    [CELLXGENE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO],
  ],
]);

// SOURCE STUDIES

export const SOURCE_STUDY_DRAFT_OK: TestPublishedSourceStudy = {
  doi: DOI_DRAFT_OK,
  doiStatus: DOI_STATUS.OK,
  id: "d2932506-0af5-4030-920c-07f6beeb817a",
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
    capId: "cap-id-published-with-cap-and-cellxgene",
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

// Source studies initialized in the database before tests
export const INITIAL_TEST_SOURCE_STUDIES = [
  SOURCE_STUDY_DRAFT_OK,
  SOURCE_STUDY_DRAFT_NO_CROSSREF,
  SOURCE_STUDY_PUBLIC_NO_CROSSREF,
  SOURCE_STUDY_PUBLIC_WITH_PREPRINT,
  SOURCE_STUDY_PUBLIC_WITH_JOURNAL,
  SOURCE_STUDY_SHARED,
  SOURCE_STUDY_PUBLISHED_WITH_HCA,
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
];

export const TEST_SOURCE_STUDIES = [...INITIAL_TEST_SOURCE_STUDIES];

// SOURCE DATASETS

export const SOURCE_DATASET_FOO: TestSourceDataset = {
  assay: ["assay foo"],
  cellCount: 354,
  disease: ["disease foo"],
  id: "6e1e281d-78cb-462a-ae29-94663c1e5713",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  suspensionType: ["suspension type foo"],
  tissue: ["tissue foo"],
  title: "Source Dataset Foo",
};

export const SOURCE_DATASET_BAR: TestSourceDataset = {
  id: "cd053619-8b50-4e2d-ba62-96fbbcad6011",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  title: "Source Dataset Bar",
};

export const SOURCE_DATASET_BAZ: TestSourceDataset = {
  id: "3682751a-7a97-48e1-a43e-d355c1707e26",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  title: "Source Dataset Baz",
};

export const SOURCE_DATASET_FOOFOO: TestSourceDataset = {
  assay: ["assay foofoo"],
  cellCount: 534,
  disease: ["disease foofoo"],
  id: "5c42bc65-93ad-4191-95bc-a40d56f2bb6b",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  suspensionType: ["suspension type foofoo"],
  tissue: ["tissue foofoo"],
  title: "Source Dataset Foofoo",
};

export const SOURCE_DATASET_FOOBAR: TestSourceDataset = {
  id: "4de3dadd-a35c-4386-be62-4536934e9179",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  title: "Source Dataset Foobar",
};

export const SOURCE_DATASET_FOOBAZ: TestSourceDataset = {
  id: "7ac2afd8-493d-46e5-b9d8-cadc512bb2cc",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  title: "Source Dataset Foobar",
};

export const SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE: TestSourceDataset = {
  assay: ["foo"],
  cellCount: 123,
  cellxgeneDatasetId: CELLXGENE_ID_DATASET_WITHOUT_UPDATE,
  cellxgeneDatasetVersion: CELLXGENE_VERSION_DATASET_WITHOUT_UPDATE,
  disease: ["bar"],
  id: "afcb9181-5a6b-45a8-89c0-1790def2d7dc",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  suspensionType: ["foobarbaz"],
  tissue: ["baz"],
  title: "Source Dataset CELLxGENE Without Update",
};

export const SOURCE_DATASET_CELLXGENE_WITH_UPDATE: TestSourceDataset = {
  assay: ["foobarfoo"],
  cellCount: 4567,
  cellxgeneDatasetId: CELLXGENE_ID_DATASET_WITH_UPDATE,
  cellxgeneDatasetVersion: "cellxgene-version-dataset-with-update-a",
  disease: ["barbarfoo"],
  id: "04ccf7fd-22eb-4236-829c-9a0058580d36",
  sourceStudyId: SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
  suspensionType: ["foobazbarfoo"],
  tissue: ["bazbarfoo"],
  title: "Source Dataset CELLxGENE With Update",
};

export const SOURCE_DATASET_DRAFT_OK_FOO: TestSourceDataset = {
  id: "edf62340-8180-4206-87f2-d95e388a3a4c",
  sourceStudyId: SOURCE_STUDY_DRAFT_OK.id,
  title: "Source Dataset Draft OK Foo",
};

export const SOURCE_DATASET_DRAFT_OK_BAR: TestSourceDataset = {
  id: "3b41d607-05ff-48a7-92bd-9d257a230b3d",
  sourceStudyId: SOURCE_STUDY_DRAFT_OK.id,
  title: "Source Dataset Draft OK Bar",
};

export const SOURCE_DATASET_OTHER_FOO: TestSourceDataset = {
  assay: ["assay other foo"],
  cellCount: 23424,
  disease: ["disease other foo"],
  id: "d85cf1fd-3b70-4f6a-812c-583941362117",
  sourceStudyId: SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS.id,
  suspensionType: ["suspension type other foo"],
  tissue: ["tissue other foo"],
  title: "Source Dataset Other Foo",
};

export const SOURCE_DATASET_OTHER_BAR: TestSourceDataset = {
  assay: ["assay other bar"],
  cellCount: 23424,
  disease: ["disease other bar"],
  id: "e3878dde-ffe5-4193-9b7f-5a395541ba25",
  sourceStudyId: SOURCE_STUDY_WITH_OTHER_SOURCE_DATASETS.id,
  suspensionType: ["suspension type other bar"],
  tissue: ["tissue other bar"],
  title: "Source Dataset Other Bar",
};

export const SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO: TestSourceDataset =
  {
    assay: ["assay unpublished with cellxgene foo"],
    cellCount: 5464,
    cellxgeneDatasetId: CELLXGENE_ID_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
    cellxgeneDatasetVersion:
      CELLXGENE_VERSION_DATASET_UNPUBLISHED_WITH_CELLXGENE_FOO,
    disease: ["disease unpublished with cellxgene foo"],
    id: "1d872ee4-cfb3-4893-a275-fe0f105697c4",
    sourceStudyId: SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
    suspensionType: ["suspension type unpublished with cellxgene foo"],
    tissue: ["tissue unpublished with cellxgene foo"],
    title: "Source Dataset Unpublished With CELLxGENE Foo",
  };

export const SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR: TestSourceDataset =
  {
    assay: ["assay unpublished with cellxgene bar"],
    cellCount: 3493,
    cellxgeneDatasetId: CELLXGENE_ID_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
    cellxgeneDatasetVersion:
      CELLXGENE_VERSION_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAR,
    disease: ["disease unpublished with cellxgene bar"],
    id: "30bd81d7-1db7-4f28-b6d3-6afa73066f99",
    sourceStudyId: SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
    suspensionType: ["suspension type unpublished with cellxgene bar"],
    tissue: ["tissue unpublished with cellxgene bar"],
    title: "Source Dataset Unpublished With CELLxGENE Bar",
  };

export const SOURCE_DATASET_UNPUBLISHED_WITH_CELLXGENE_BAZ: TestSourceDataset =
  {
    assay: ["assay unpublished with cellxgene baz"],
    cellCount: 64345,
    disease: ["disease unpublished with cellxgene baz"],
    id: "4b7acc76-89f2-4839-a15c-fc79183c1ed7",
    sourceStudyId: SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
    suspensionType: ["suspension type unpublished with cellxgene baz"],
    tissue: ["tissue unpublished with cellxgene baz"],
    title: "Source Dataset Unpublished With CELLxGENE Baz",
  };

export const SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO: TestSourceDataset =
  {
    assay: ["assay published without cellxgene id foo"],
    cellCount: 34538,
    cellxgeneDatasetId: CELLXGENE_ID_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
    cellxgeneDatasetVersion:
      CELLXGENE_VERSION_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
    disease: ["disease published without cellxgene id foo"],
    id: "68dbf3ec-45a5-43a4-b806-97923de1df2c",
    sourceStudyId: SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID.id,
    suspensionType: ["suspension type published without cellxgene id foo"],
    tissue: ["tissue published without cellxgene id foo"],
    title: "Source Dataset Published Without CELLxGENE ID Foo",
  };

export const SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR: TestSourceDataset =
  {
    assay: ["assay published without cellxgene id bar"],
    cellCount: 2348,
    disease: ["disease published without cellxgene id bar"],
    id: "2d4f2d93-7c2c-4c1f-94af-566f3d3ed8ec",
    sourceStudyId: SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID.id,
    suspensionType: ["suspension type published without cellxgene id bar"],
    tissue: ["tissue published without cellxgene id bar"],
    title: "Source Dataset Published Without CELLxGENE ID Bar",
  };

// Source datasets intitialized in the database before tests
export const INITIAL_TEST_SOURCE_DATASETS = [
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
];

// ATLAS IDS

const ATLAS_ID_DRAFT = "823dcc68-340b-4a61-8883-c61dc4975ce3";
const ATLAS_ID_PUBLIC = "94f62ad0-99cb-4f01-a1cf-cce2d56a8850";
const ATLAS_ID_WITH_MISC_SOURCE_STUDIES =
  "8259a9b1-c149-4310-83a5-d126b675c0f1";

// USERS

export const USER_NONEXISTENT = makeTestUser("test-nonexistant");
export const USER_NEW = makeTestUser("test-new");

export const USER_UNREGISTERED = makeTestUser("test-unregistered");
export const USER_STAKEHOLDER = makeTestUser(
  "test-stakeholder",
  ROLE.STAKEHOLDER
);
export const USER_STAKEHOLDER2 = makeTestUser(
  "test-stakeholder2",
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
export const USER_INTEGRATION_LEAD_DRAFT = makeTestUser(
  "test-integration-lead-draft",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_DRAFT]
);
export const USER_INTEGRATION_LEAD_PUBLIC = makeTestUser(
  "test-integration-lead-public",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_PUBLIC]
);
export const USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES = makeTestUser(
  "test-integration-lead-with-misc-source-studies",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES]
);
export const USER_INTEGRATION_LEAD_WITH_NEW_ATLAS = makeTestUser(
  "test-integration-lead-with-new-atlas",
  ROLE.INTEGRATION_LEAD,
  false,
  [ATLAS_ID_DRAFT]
);
export const USER_CELLXGENE_ADMIN = makeTestUser(
  "test-cellxgene-admin",
  ROLE.CELLXGENE_ADMIN
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
  USER_INTEGRATION_LEAD_WITH_NEW_ATLAS,
  USER_CELLXGENE_ADMIN,
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
  [ATLAS_ID_WITH_MISC_SOURCE_STUDIES]:
    USER_INTEGRATION_LEAD_WITH_MISC_SOURCE_STUDIES,
};

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
  shortName: "test-draft",
  sourceStudies: [
    SOURCE_STUDY_DRAFT_OK.id,
    SOURCE_STUDY_SHARED.id,
    SOURCE_STUDY_DRAFT_NO_CROSSREF.id,
  ],
  status: ATLAS_STATUS.DRAFT,
  version: "1.2",
  wave: "1",
};

export const ATLAS_PUBLIC: TestAtlas = {
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
  network: "lung",
  shortName: "test-public",
  sourceStudies: [SOURCE_STUDY_PUBLIC_NO_CROSSREF.id, SOURCE_STUDY_SHARED.id],
  status: ATLAS_STATUS.PUBLIC,
  targetCompletion: new Date("2024-05-28T22:31:45.731Z"),
  version: "2.3",
  wave: "1",
};

export const ATLAS_WITH_IL: TestAtlas = {
  id: "798b563d-16ff-438a-8e15-77be05b1f8ec",
  integrationLead: [INTEGRATION_LEAD_BAZ],
  network: "heart",
  shortName: "test-with-il",
  sourceStudies: [],
  status: ATLAS_STATUS.DRAFT,
  version: "2.0",
  wave: "3",
};

export const ATLAS_WITH_MISC_SOURCE_STUDIES: TestAtlas = {
  id: ATLAS_ID_WITH_MISC_SOURCE_STUDIES,
  integrationLead: [INTEGRATION_LEAD_BAZ_BAZ],
  network: "adipose",
  shortName: "test-with-misc-source-studies",
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
  ],
  status: ATLAS_STATUS.PUBLIC,
  version: "2.3",
  wave: "2",
};

export const ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A: TestAtlas = {
  id: "7ce0814d-606c-475b-942a-0f72ff8c5c0b",
  integrationLead: [],
  network: "organoid",
  shortName: "test-with-source-study-validations-a",
  sourceStudies: [
    SOURCE_STUDY_PUBLISHED_WITH_HCA.id,
    SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_MISMATCH.id,
    SOURCE_STUDY_PUBLISHED_WITH_HCA_TITLE_NEAR_MATCH.id,
    SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_PRIMARY_DATA.id,
  ],
  status: ATLAS_STATUS.DRAFT,
  version: "5.4",
  wave: "2",
};

export const ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B: TestAtlas = {
  id: "9766683a-3c8d-4ec8-b8b5-3fceb8fe0d31",
  integrationLead: [],
  network: "gut",
  shortName: "test-with-source-study-validations-b",
  sourceStudies: [
    SOURCE_STUDY_UNPUBLISHED_WITH_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_NO_HCA_OR_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_NO_CELLXGENE.id,
    SOURCE_STUDY_PUBLISHED_WITH_CAP_AND_CELLXGENE.id,
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
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_A,
  ATLAS_WITH_SOURCE_STUDY_VALIDATIONS_B,
];

export const INITIAL_TEST_ATLASES_BY_SOURCE_STUDY = INITIAL_TEST_ATLASES.reduce(
  (atlasesByStudy, atlas) => {
    for (const studyId of atlas.sourceStudies) {
      (atlasesByStudy[studyId] || (atlasesByStudy[studyId] = [])).push(atlas);
    }
    return atlasesByStudy;
  },
  {} as Record<string, TestAtlas[]>
);

// COMPONENT ATLASES

export const COMPONENT_ATLAS_DRAFT_FOO: TestComponentAtlas = {
  atlasId: ATLAS_DRAFT.id,
  id: "b1820416-5886-4585-b0fe-7f70487331d8",
  sourceDatasets: [
    SOURCE_DATASET_FOOFOO,
    SOURCE_DATASET_FOOBAR,
    SOURCE_DATASET_FOOBAZ,
  ],
  title: "Component Atlas Draft Foo",
};

export const COMPONENT_ATLAS_DRAFT_BAR: TestComponentAtlas = {
  atlasId: ATLAS_DRAFT.id,
  id: "484bc93b-836d-4efe-880a-de90eb1c4dfb",
  sourceDatasets: [
    SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
    SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  ],
  title: "Component Atlas Draft Bar",
};

export const COMPONENT_ATLAS_MISC_FOO: TestComponentAtlas = {
  atlasId: ATLAS_WITH_MISC_SOURCE_STUDIES.id,
  id: "b95614cc-5356-4f47-b3a2-da05d23e86ce",
  sourceDatasets: [
    SOURCE_DATASET_FOO,
    SOURCE_DATASET_FOOFOO,
    SOURCE_DATASET_OTHER_FOO,
    SOURCE_DATASET_OTHER_BAR,
  ],
  title: "Component Atlas Misc Foo",
};

// Component atlases to initialize in the database before tests
export const INITIAL_TEST_COMPONENT_ATLASES = [
  COMPONENT_ATLAS_DRAFT_FOO,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_MISC_FOO,
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
      comment
    );
    return byThread;
  },
  {} as Record<string, TestComment[]>
);
