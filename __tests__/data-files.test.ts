import {
  FILE_STATUS,
  FILE_TYPE,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  confirmFileExistsOnAtlas,
  getAtlasByNetworkVersionAndShortName,
  upsertFileRecord,
} from "../app/data/files";
import { doTransaction, endPgPool, query } from "../app/services/database";
import { NotFoundError } from "../app/utils/api-handler";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_IL,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  COMPONENT_ATLAS_DRAFT_FOO,
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
        `File with id ${fileId} doesn't exist on the specified atlas.`
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
        `File with id ${nonExistentFileId} doesn't exist on the specified atlas.`
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

    it("should use standard error message", async () => {
      const nonExistentFileId = "550e8400-e29b-41d4-a716-446655440098";

      await expect(
        confirmFileExistsOnAtlas(nonExistentFileId, ATLAS_DRAFT.id)
      ).rejects.toThrow(
        `File with id ${nonExistentFileId} doesn't exist on the specified atlas.`
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

describe("upsertFileRecord", () => {
  // Test constants to avoid duplication
  const TEST_BUCKET = "test-bucket";
  const TEST_KEY = "test/path/file.h5ad";
  const TEST_ETAG = "test-etag-123";
  const TEST_ETAG_ALT = "test-etag-456";
  const TEST_SNS_MESSAGE_ID = "test-sns-message-id-123";
  const TEST_SHA256 = null;
  const TEST_VERSION_ID = "test-version-123";
  const TEST_SIZE_BYTES = 1024;
  const TEST_EVENT_INFO = JSON.stringify({
    eventName: "s3:ObjectCreated:Put",
    eventTime: "2023-01-01T00:00:00.000Z",
  });
  const SELECT_FILE_QUERY =
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2";

  beforeEach(async () => {
    await resetDatabase();
  });

  describe("successful operations", () => {
    it("should insert a new file record", async () => {
      const mockFileData = {
        bucket: TEST_BUCKET,
        componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id, // Valid UUID
        etag: TEST_ETAG,
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INTEGRATED_OBJECT,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY,
        sha256Client: TEST_SHA256,
        sizeBytes: TEST_SIZE_BYTES,
        snsMessageId: TEST_SNS_MESSAGE_ID,
        sourceDatasetId: null,
        status: FILE_STATUS.UPLOADED,
        versionId: TEST_VERSION_ID,
      };

      const result = await doTransaction(async (transaction) => {
        return await upsertFileRecord(mockFileData, transaction);
      });

      const EXPECTED_OPERATION = "inserted";
      const EXPECTED_ETAG = TEST_ETAG; // Should match the input etag

      expect(result.operation).toBe(EXPECTED_OPERATION);
      expect(result.etag).toBe(EXPECTED_ETAG);

      // Verify the record was actually inserted
      const queryResult = await query(SELECT_FILE_QUERY, [
        mockFileData.bucket,
        mockFileData.key,
      ]);
      expect(queryResult.rows).toHaveLength(1);
      expect(queryResult.rows[0].etag).toBe(TEST_ETAG);
      expect(queryResult.rows[0].is_latest).toBe(true);
    });

    it("should update existing file record with identical request (true idempotency)", async () => {
      const fileData = {
        bucket: TEST_BUCKET,
        componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id, // Valid UUID for integrated_object
        etag: TEST_ETAG,
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INTEGRATED_OBJECT,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY,
        sha256Client: null,
        sizeBytes: TEST_SIZE_BYTES,
        snsMessageId: TEST_SNS_MESSAGE_ID,
        sourceDatasetId: null, // Must be null for integrated_object
        status: FILE_STATUS.UPLOADED,
        versionId: TEST_VERSION_ID,
      };

      // First insert
      await doTransaction(async (transaction) => {
        return await upsertFileRecord(fileData, transaction);
      });

      // Second insert with IDENTICAL data (duplicate S3 notification)
      const result = await doTransaction(async (transaction) => {
        return await upsertFileRecord(fileData, transaction);
      });

      expect(result.operation).toBe("updated");
      expect(result.etag).toBe(TEST_ETAG);

      // Verify only one record exists
      const queryResult = await query(SELECT_FILE_QUERY, [
        fileData.bucket,
        fileData.key,
      ]);
      expect(queryResult.rows).toHaveLength(1);
    });

    it("should handle null values correctly", async () => {
      const fileData = {
        bucket: TEST_BUCKET,
        componentAtlasId: null, // Must be null for source_dataset
        etag: TEST_ETAG_ALT,
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.SOURCE_DATASET,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: "test/path/dataset.h5ad",
        sha256Client: null, // This should be allowed
        sizeBytes: 2048,
        snsMessageId: "test-sns-message-789",
        sourceDatasetId: SOURCE_DATASET_DRAFT_OK_FOO.id, // Valid UUID for source_dataset
        status: FILE_STATUS.UPLOADED,
        versionId: null, // This should be allowed
      };

      const result = await doTransaction(async (transaction) => {
        return await upsertFileRecord(fileData, transaction);
      });

      expect(result.operation).toBe("inserted");
      expect(result.etag).toBe(TEST_ETAG_ALT);

      // Verify null values were stored correctly
      const queryResult = await query(SELECT_FILE_QUERY, [
        fileData.bucket,
        fileData.key,
      ]);
      expect(queryResult.rows[0].sha256_client).toBeNull();
      expect(queryResult.rows[0].version_id).toBeNull();
    });
  });

  describe("conflict handling", () => {
    it("should throw error when ETag differs (data integrity protection)", async () => {
      const originalFileData = {
        bucket: TEST_BUCKET,
        componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id, // Valid UUID for integrated_object
        etag: "original-etag",
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INTEGRATED_OBJECT,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY,
        sha256Client: null,
        sizeBytes: TEST_SIZE_BYTES,
        snsMessageId: "original-sns-message",
        sourceDatasetId: null,
        status: FILE_STATUS.UPLOADED,
        versionId: "test-version-123",
      };

      // Insert original file
      await doTransaction(async (transaction) => {
        return await upsertFileRecord(originalFileData, transaction);
      });

      // Try to update with different ETag (should throw error)
      const conflictingFileData = {
        ...originalFileData,
        etag: "different-etag", // Different ETag indicates potential corruption
        snsMessageId: originalFileData.snsMessageId, // Same SNS message ID to trigger conflict
      };

      // Should throw error when ETag mismatch is detected
      await expect(
        doTransaction(async (transaction) => {
          return await upsertFileRecord(conflictingFileData, transaction);
        })
      ).rejects.toThrow("ETag mismatch detected");

      // Verify original record unchanged
      const queryResult = await query(
        "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
        [originalFileData.bucket, originalFileData.key]
      );
      expect(queryResult.rows[0].etag).toBe("original-etag");
    });
  });
});

describe("getAtlasByNetworkVersionAndShortName", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe("successful lookups", () => {
    it("should find atlas by exact version match", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_DRAFT.network,
        ATLAS_DRAFT.version,
        ATLAS_DRAFT.shortName
      );

      expect(atlasId).toBe(ATLAS_DRAFT.id);
    });

    it("should find atlas with version without decimal (2.0 -> 2)", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        "2.0",
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(ATLAS_WITH_IL.id);
    });

    it("should find atlas with case-insensitive short name match", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_DRAFT.network,
        ATLAS_DRAFT.version,
        "TEST-DRAFT"
      );

      expect(atlasId).toBe(ATLAS_DRAFT.id);
    });

    it("should prioritize exact version match over decimal-stripped version", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        ATLAS_WITH_IL.version,
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(ATLAS_WITH_IL.id);
    });
  });

  describe("error cases", () => {
    it("should throw error when atlas not found by network", async () => {
      await expect(
        getAtlasByNetworkVersionAndShortName(
          "nonexistent-network",
          ATLAS_DRAFT.version,
          ATLAS_DRAFT.shortName
        )
      ).rejects.toThrow(
        `Atlas not found for network: nonexistent-network, shortName: ${ATLAS_DRAFT.shortName}, version: ${ATLAS_DRAFT.version}`
      );
    });

    it("should throw error when atlas not found by version", async () => {
      await expect(
        getAtlasByNetworkVersionAndShortName(
          ATLAS_DRAFT.network,
          "99.99",
          ATLAS_DRAFT.shortName
        )
      ).rejects.toThrow(
        `Atlas not found for network: ${ATLAS_DRAFT.network}, shortName: ${ATLAS_DRAFT.shortName}, version: 99.99`
      );
    });

    it("should throw error when atlas not found by short name", async () => {
      await expect(
        getAtlasByNetworkVersionAndShortName(
          ATLAS_DRAFT.network,
          ATLAS_DRAFT.version,
          "nonexistent-atlas"
        )
      ).rejects.toThrow("Atlas not found");
    });
  });

  describe("version matching edge cases", () => {
    it("should handle version with multiple decimals", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        "2.0.0",
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(ATLAS_WITH_IL.id);
    });

    it("should handle single digit version matching decimal version", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        "2",
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(ATLAS_WITH_IL.id);
    });
  });
});
