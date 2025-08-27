import { FILE_TYPE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { confirmFileExistsOnAtlas } from "../app/data/files";
import { endPgPool } from "../app/services/database";
import { NotFoundError } from "../app/utils/api-handler";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  FILE_COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_DRAFT_OK_FOO,
} from "../testing/constants";
import { initTestFile, resetDatabase } from "../testing/db-utils";

// Mock external dependencies
jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("next-auth");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("confirmFileExistsOnAtlas", () => {
  describe("integrated object files via component atlas", () => {
    it("should pass when file exists on the specified atlas via component atlas", async () => {
      // Use existing test file that's linked to component atlas
      const fileId = FILE_COMPONENT_ATLAS_DRAFT_FOO.id;
      const atlasId = ATLAS_DRAFT.id;

      // Should not throw an error
      await expect(
        confirmFileExistsOnAtlas(fileId, atlasId)
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError when file exists but on different atlas", async () => {
      // Use existing test file linked to one atlas, but check against different atlas
      const fileId = FILE_COMPONENT_ATLAS_DRAFT_FOO.id;
      const wrongAtlasId = ATLAS_WITH_MISC_SOURCE_STUDIES.id;

      // Should throw NotFoundError when checking for different atlas
      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId)
      ).rejects.toThrow(
        `File with id ${fileId} doesn't exist on atlas with ID ${wrongAtlasId}`
      );
    });
  });

  describe("source dataset files", () => {
    it("should pass when source dataset file exists (source datasets are atlas-agnostic)", async () => {
      // Create a source dataset file using initTestFile
      const testFileId = "550e8400-e29b-41d4-a716-446655440010";
      const sourceDatasetId = SOURCE_DATASET_DRAFT_OK_FOO.id;

      await initTestFile(testFileId, {
        bucket: "test-bucket-source-dataset",
        etag: "550e8400-e29b-41d4-a716-test-etag",
        fileType: FILE_TYPE.SOURCE_DATASET,
        key: "test/atlas-v1/source-datasets/test.h5ad",
        sizeBytes: 1024000,
        sourceDatasetId,
      });

      // Should not throw an error for any atlas (source datasets are atlas-agnostic)
      await expect(
        confirmFileExistsOnAtlas(testFileId, ATLAS_DRAFT.id)
      ).resolves.toBeUndefined();

      await expect(
        confirmFileExistsOnAtlas(testFileId, ATLAS_WITH_MISC_SOURCE_STUDIES.id)
      ).resolves.toBeUndefined();
    });
  });

  describe("error cases", () => {
    it("should throw NotFoundError when file doesn't exist", async () => {
      const nonExistentFileId = "550e8400-e29b-41d4-a716-446655440099";

      await expect(
        confirmFileExistsOnAtlas(nonExistentFileId, ATLAS_DRAFT.id)
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(nonExistentFileId, ATLAS_DRAFT.id)
      ).rejects.toThrow(
        `File with id ${nonExistentFileId} doesn't exist on atlas with ID ${ATLAS_DRAFT.id}`
      );
    });

    it("should throw NotFoundError when file exists but doesn't match criteria", async () => {
      // Create an orphan file that doesn't match either condition (no component_atlas_id and no source_dataset_id)
      const testFileId = "550e8400-e29b-41d4-a716-446655440011";

      await initTestFile(testFileId, {
        bucket: "test-bucket-orphan",
        etag: "550e8400-e29b-41d4-a716-test-etag2",
        fileType: FILE_TYPE.INGEST_MANIFEST,
        key: "test/atlas-v1/manifests/test.json",
        sizeBytes: 1024,
      });

      await expect(
        confirmFileExistsOnAtlas(testFileId, ATLAS_DRAFT.id)
      ).rejects.toThrow(NotFoundError);
    });

    it("should use custom fileTypeDescription in error message", async () => {
      const customDescription = "Component atlas file";
      const nonExistentFileId = "550e8400-e29b-41d4-a716-446655440098";

      await expect(
        confirmFileExistsOnAtlas(
          nonExistentFileId,
          ATLAS_DRAFT.id,
          customDescription
        )
      ).rejects.toThrow(
        `${customDescription} with id ${nonExistentFileId} doesn't exist on atlas with ID ${ATLAS_DRAFT.id}`
      );
    });
  });

  describe("edge cases", () => {
    it("should handle invalid UUID format for file ID", async () => {
      // Test with invalid UUID format - should get database error, not NotFoundError
      await expect(
        confirmFileExistsOnAtlas("invalid-uuid", ATLAS_DRAFT.id)
      ).rejects.toThrow(); // Any error is fine, just not a successful resolution
    });

    it("should handle invalid UUID format for atlas ID", async () => {
      // Use existing test file
      const fileId = FILE_COMPONENT_ATLAS_DRAFT_FOO.id;

      // Should get database error due to invalid UUID format
      await expect(
        confirmFileExistsOnAtlas(fileId, "invalid-uuid")
      ).rejects.toThrow(); // Any error is fine
    });
  });
});
