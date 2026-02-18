import { FILE_TYPE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { createComponentAtlas } from "../app/services/component-atlases";
import { endPgPool, query } from "../app/services/database";
import { ATLAS_DRAFT, EMPTY_COMPONENT_INFO } from "../testing/constants";
import {
  createTestFile,
  getAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { expectIsDefined } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const ATLAS_ID_NONEXISTENT = "ea885ef9-54ae-42c7-8a7a-75c32e4703a6";

const FILE_ID_NONEXISTENT_ATLAS = "0f0864cf-2d33-4122-a3a6-967167be3496";
const FILE_ID_SUCCESSFUL = "607b7741-1532-436d-aa5d-ad659b57ac78";

const FILE_IDS = [FILE_ID_NONEXISTENT_ATLAS, FILE_ID_SUCCESSFUL];

const CONCEPT_ID_NONEXISTENT_ATLAS = "f1bfda5d-fae3-4685-aaf0-24ebd422c13e";
const CONCEPT_ID_SUCCESSFUL = "a51561dc-a383-489d-b492-6d1781c85006";

const CONCEPT_IDS = [CONCEPT_ID_NONEXISTENT_ATLAS, CONCEPT_ID_SUCCESSFUL];

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await query("DELETE FROM hat.component_atlases WHERE id=ANY($1)", [
    CONCEPT_IDS,
  ]);
  await query("DELETE FROM hat.files WHERE id=ANY($1)", [FILE_IDS]);
  await query("DELETE FROM hat.concepts WHERE id=ANY($1)", [CONCEPT_IDS]);

  await endPgPool();
});

describe("createComponentAtlas", () => {
  it("throws error when creating component atlas for non-existent atlas", async () => {
    await createTestFile(FILE_ID_NONEXISTENT_ATLAS, {
      bucket: "bucket-nonexistent-atlas",
      conceptId: CONCEPT_ID_NONEXISTENT_ATLAS,
      etag: "bfe8b775d61f4f8aaad1a6c2b9c12222",
      fileType: FILE_TYPE.INTEGRATED_OBJECT,
      key: "lung/some-atlas-v1/integrated-objects/file-nonexistent-atlas.h5ad",
      sizeBytes: 2342,
    });
    await expect(
      (async (): Promise<void> => {
        await createComponentAtlas(
          ATLAS_ID_NONEXISTENT,
          FILE_ID_NONEXISTENT_ATLAS,
          CONCEPT_ID_NONEXISTENT_ATLAS,
        );
      })(),
    ).rejects.toThrow();
  });

  it("creates component atlas with empty values in component info", async () => {
    await createTestFile(FILE_ID_SUCCESSFUL, {
      bucket: "bucket-successful",
      conceptId: CONCEPT_ID_SUCCESSFUL,
      etag: "fc7112b0ae8f49a6896e4d0d3f76714b",
      fileType: FILE_TYPE.INTEGRATED_OBJECT,
      key: "lung/some-atlas-v1/integrated-objects/file-successful.h5ad",
      sizeBytes: 64342,
    });

    const result = await createComponentAtlas(
      ATLAS_DRAFT.id,
      FILE_ID_SUCCESSFUL,
      CONCEPT_ID_SUCCESSFUL,
    );

    expect(result).toBeDefined();
    expect(result.component_info).toEqual(EMPTY_COMPONENT_INFO);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();

    const atlas = await getAtlasFromDatabase(ATLAS_DRAFT.id);
    if (!expectIsDefined(atlas)) return;
    expect(atlas.component_atlases).toContain(result.version_id);
  });
});
