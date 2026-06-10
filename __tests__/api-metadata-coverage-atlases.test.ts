import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  AtlasMetadataCoverage,
  AtlasMetadataCoverageRollup,
  FileMetadataCoverage,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { endPgPool, query } from "../app/services/database";
import metadataCoverageAtlasesHandler from "../pages/api/metadata-coverage/atlases";
import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  ATLAS_WITH_MISC_SOURCE_STUDIES_B,
  COMPONENT_ATLAS_MISC_FOO,
  INTEGRATION_LEAD_BAZ_BAZ,
  SOURCE_DATASET_BAR,
  SOURCE_DATASET_FOO,
  STAKEHOLDER_ANALOGOUS_ROLES,
  USER_CONTENT_ADMIN,
  USER_UNREGISTERED,
} from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
import { TestUser } from "../testing/entities";
import { testApiRole, withConsoleErrorHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

jest.mock("next-auth");

const TEST_ROUTE = "/api/metadata-coverage/atlases";

// Coverage blob set on SOURCE_DATASET_FOO's file (a source dataset of
// ATLAS_WITH_MISC_SOURCE_STUDIES). Includes an `obs` entry and an unknown
// dataset field, both of which must be ignored by the rollup.
const COVERAGE_SOURCE_DATASET_FOO: FileMetadataCoverage = {
  entities: {
    dataset: { recordCount: 1 },
    donor: { recordCount: 10 },
    obs: { recordCount: 100 },
    sample: { recordCount: 5 },
  },
  fieldCoverage: [
    fieldCoverage("dataset", "alignment_software", 1, 0, 0),
    fieldCoverage("dataset", "assay_ontology_term_id", 0, 1, 0),
    fieldCoverage("dataset", "batch_condition", 1, 0, 0), // recommended
    fieldCoverage("dataset", "not_a_real_field", 5, 5, 5), // ignored: not in dictionary
    fieldCoverage("donor", "donor_id", 7, 2, 1),
    fieldCoverage("obs", "ignored_field", 9, 9, 9), // ignored: obs class
    fieldCoverage("sample", "cell_enrichment", 4, 1, 0),
    fieldCoverage("sample", "age_range", 2, 3, 0), // recommended
  ],
  schemaName: "test-schema",
  schemaVersion: "1.0.0",
};

// Coverage blob set on SOURCE_DATASET_BAR's file (another source dataset of the
// same atlas), to verify summing across an atlas's files.
const COVERAGE_SOURCE_DATASET_BAR: FileMetadataCoverage = {
  entities: {
    dataset: { recordCount: 1 },
    donor: { recordCount: 5 },
    obs: { recordCount: 50 },
    sample: { recordCount: 3 },
  },
  fieldCoverage: [
    fieldCoverage("dataset", "alignment_software", 1, 0, 0),
    fieldCoverage("donor", "donor_id", 3, 2, 0),
    fieldCoverage("sample", "cell_enrichment", 2, 1, 0),
  ],
  schemaName: "test-schema",
  schemaVersion: "1.0.0",
};

// Coverage blob set on COMPONENT_ATLAS_MISC_FOO's file (an integrated object of
// the same atlas).
const COVERAGE_INTEGRATED_OBJECT_FOO: FileMetadataCoverage = {
  entities: {
    dataset: { recordCount: 1 },
    donor: { recordCount: 20 },
    obs: { recordCount: 200 },
    sample: { recordCount: 8 },
  },
  fieldCoverage: [
    fieldCoverage("dataset", "alignment_software", 1, 0, 0),
    fieldCoverage("donor", "donor_id", 15, 5, 0),
    fieldCoverage("sample", "cell_enrichment", 6, 2, 0),
  ],
  schemaName: "test-schema",
  schemaVersion: "1.0.0",
};

beforeAll(async () => {
  await resetDatabase();
  await setFileMetadataCoverage(
    SOURCE_DATASET_FOO.file.id,
    COVERAGE_SOURCE_DATASET_FOO,
  );
  await setFileMetadataCoverage(
    SOURCE_DATASET_BAR.file.id,
    COVERAGE_SOURCE_DATASET_BAR,
  );
  await setFileMetadataCoverage(
    COMPONENT_ATLAS_MISC_FOO.file.id,
    COVERAGE_INTEGRATED_OBJECT_FOO,
  );
});

afterAll(async () => {
  endPgPool();
});

describe(TEST_ROUTE, () => {
  it("returns error 405 for non-GET request", async () => {
    expect(
      (await doRequest(USER_CONTENT_ADMIN, METHOD.POST))._getStatusCode(),
    ).toEqual(405);
  });

  it("returns error 401 for logged out user", async () => {
    expect(
      (await doRequest(undefined, METHOD.GET, {}, true))._getStatusCode(),
    ).toEqual(401);
  });

  it("returns error 403 for unregistered user", async () => {
    expect(
      (
        await doRequest(USER_UNREGISTERED, METHOD.GET, {}, true)
      )._getStatusCode(),
    ).toEqual(403);
  });

  it("returns error 400 for invalid source parameter", async () => {
    expect(
      (
        await doRequest(USER_CONTENT_ADMIN, METHOD.GET, { source: "foo" }, true)
      )._getStatusCode(),
    ).toEqual(400);
  });

  it("returns error 400 for invalid required parameter", async () => {
    expect(
      (
        await doRequest(
          USER_CONTENT_ADMIN,
          METHOD.GET,
          { required: "required,bogus" },
          true,
        )
      )._getStatusCode(),
    ).toEqual(400);
  });

  for (const role of STAKEHOLDER_ANALOGOUS_ROLES) {
    testApiRole(
      "returns metadata coverage rollup",
      TEST_ROUTE,
      metadataCoverageAtlasesHandler,
      METHOD.GET,
      role,
      undefined,
      undefined,
      false,
      (res) => {
        expect(res._getStatusCode()).toEqual(200);
      },
    );
  }

  it("aggregates source dataset coverage for the required tier by default", async () => {
    const atlas = await getAtlasFromResponse(
      await doRequest(USER_CONTENT_ADMIN, METHOD.GET, {}),
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    );

    expect(atlas.name).toEqual(ATLAS_WITH_MISC_SOURCE_STUDIES.shortName);
    expect(atlas.version).toEqual("2.3");
    expect(atlas.generation).toEqual(2);
    expect(atlas.bionetwork).toEqual("adipose");
    expect(atlas.integrationLeads).toEqual([
      {
        email: INTEGRATION_LEAD_BAZ_BAZ.email,
        name: INTEGRATION_LEAD_BAZ_BAZ.name,
      },
    ]);

    // dataset: required alignment_software (1/1 + 1/1) and assay_ontology_term_id (0/1)
    expect(atlas.classes.dataset).toEqual({
      completion: 2 / 3,
      entityCount: 2,
      filledSlots: 2,
      totalSlots: 3,
    });
    // donor: required donor_id (7/10 + 3/5)
    expect(atlas.classes.donor).toEqual({
      completion: 10 / 15,
      entityCount: 15,
      filledSlots: 10,
      totalSlots: 15,
    });
    // sample: required cell_enrichment (4/5 + 2/3)
    expect(atlas.classes.sample).toEqual({
      completion: 6 / 8,
      entityCount: 8,
      filledSlots: 6,
      totalSlots: 8,
    });
    expect(atlas.total).toEqual((2 / 3 + 10 / 15 + 6 / 8) / 3);
  });

  it("includes recommended fields when requested", async () => {
    const atlas = await getAtlasFromResponse(
      await doRequest(USER_CONTENT_ADMIN, METHOD.GET, {
        required: "required,recommended",
      }),
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    );

    // dataset gains recommended batch_condition (1/1)
    expect(atlas.classes.dataset).toEqual({
      completion: 3 / 4,
      entityCount: 2,
      filledSlots: 3,
      totalSlots: 4,
    });
    // sample gains recommended age_range (2/5)
    expect(atlas.classes.sample).toEqual({
      completion: 8 / 13,
      entityCount: 8,
      filledSlots: 8,
      totalSlots: 13,
    });
  });

  it("aggregates integrated object coverage when source is integrated_object", async () => {
    const atlas = await getAtlasFromResponse(
      await doRequest(USER_CONTENT_ADMIN, METHOD.GET, {
        source: "integrated_object",
      }),
      ATLAS_WITH_MISC_SOURCE_STUDIES.id,
    );

    expect(atlas.classes.dataset).toEqual({
      completion: 1,
      entityCount: 1,
      filledSlots: 1,
      totalSlots: 1,
    });
    expect(atlas.classes.donor).toEqual({
      completion: 15 / 20,
      entityCount: 20,
      filledSlots: 15,
      totalSlots: 20,
    });
    expect(atlas.classes.sample).toEqual({
      completion: 6 / 8,
      entityCount: 8,
      filledSlots: 6,
      totalSlots: 8,
    });
    expect(atlas.total).toEqual((1 + 15 / 20 + 6 / 8) / 3);
  });

  it("returns empty classes and zero total for atlases with no files of the requested source", async () => {
    const atlas = await getAtlasFromResponse(
      await doRequest(USER_CONTENT_ADMIN, METHOD.GET, {}),
      ATLAS_WITH_MISC_SOURCE_STUDIES_B.id,
    );
    for (const className of ["dataset", "donor", "sample"] as const) {
      expect(atlas.classes[className]).toEqual({
        completion: null,
        entityCount: 0,
        filledSlots: 0,
        totalSlots: 0,
      });
    }
    expect(atlas.total).toEqual(0);
  });
});

function fieldCoverage(
  entityClass: FileMetadataCoverage["fieldCoverage"][number]["entityClass"],
  field: string,
  complete: number,
  missing: number,
  inconsistent: number,
): FileMetadataCoverage["fieldCoverage"][number] {
  return { complete, entityClass, field, inconsistent, missing };
}

async function setFileMetadataCoverage(
  fileId: string,
  coverage: FileMetadataCoverage,
): Promise<void> {
  await query("UPDATE hat.files SET metadata_coverage = $1 WHERE id = $2", [
    JSON.stringify(coverage),
    fileId,
  ]);
}

async function getAtlasFromResponse(
  res: httpMocks.MockResponse<NextApiResponse>,
  atlasId: string,
): Promise<AtlasMetadataCoverage> {
  expect(res._getStatusCode()).toEqual(200);
  const rollup = res._getJSONData() as AtlasMetadataCoverageRollup;
  const atlases = rollup.atlases.filter((a) => a.atlasId === atlasId);
  expect(atlases).toHaveLength(1);
  return atlases[0];
}

async function doRequest(
  user?: TestUser,
  method = METHOD.GET,
  query: Record<string, string> = {},
  hideConsoleError = false,
): Promise<httpMocks.MockResponse<NextApiResponse>> {
  const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>({
    headers: { authorization: user?.authorization },
    method,
    query,
  });
  await withConsoleErrorHiding(
    () => metadataCoverageAtlasesHandler(req, res),
    hideConsoleError,
  );
  return res;
}
