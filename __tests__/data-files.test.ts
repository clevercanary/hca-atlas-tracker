import pg from "pg";
import { ETagMismatchError } from "../app/apis/catalog/hca-atlas-tracker/aws/errors";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  INTEGRITY_STATUS,
  NetworkKey,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  confirmFileExistsOnAtlas,
  FileUpsertData,
  getAtlasByNetworkVersionAndShortName,
  getExistingMetadataObjectId,
  markPreviousVersionsAsNotLatest,
  upsertFileRecord,
} from "../app/data/files";
import {
  doOrContinueTransaction,
  doTransaction,
  endPgPool,
  query,
} from "../app/services/database";
import { NotFoundError } from "../app/utils/api-handler";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_IL,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  COMPONENT_ATLAS_DRAFT_FOO,
  FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_DRAFT_OK_FOO,
} from "../testing/constants";
import { createTestFile, resetDatabase } from "../testing/db-utils";

interface TestFileUpsertData extends FileUpsertData {
  componentAtlasId: string | null;
}

// Shared test constants
const TEST_EVENT_INFO = JSON.stringify({
  eventName: "s3:ObjectCreated:Put",
  eventTime: "2023-01-01T00:00:00.000Z",
});

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
  await query(
    "DELETE FROM hat.files f WHERE f.file_type = 'integrated_object' AND NOT EXISTS (SELECT 1 FROM hat.component_atlases c WHERE c.file_id = f.id)"
  );
  await query(
    "DELETE FROM hat.files f WHERE f.file_type = 'source_dataset' AND NOT EXISTS (SELECT 1 FROM hat.source_datasets c WHERE c.file_id = f.id)"
  );
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("confirmFileExistsOnAtlas", () => {
  describe("integrated object files via component atlas", () => {
    it("should pass when file exists on the specified atlas via component atlas", async () => {
      // Use existing test file that's linked to component atlas
      const fileId = COMPONENT_ATLAS_DRAFT_FOO.file.id;
      const atlasId = ATLAS_DRAFT.id;

      // Should not throw an error
      await expect(
        confirmFileExistsOnAtlas(fileId, atlasId)
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError when file exists but on different atlas", async () => {
      // Use existing test file linked to one atlas, but check against different atlas
      const fileId = COMPONENT_ATLAS_DRAFT_FOO.file.id;
      const wrongAtlasId = ATLAS_WITH_MISC_SOURCE_STUDIES.id;

      // Should throw NotFoundError when checking for different atlas
      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId)
      ).rejects.toThrow(
        `No files exist on atlas with ID ${wrongAtlasId} with ID(s): ${COMPONENT_ATLAS_DRAFT_FOO.file.id}`
      );
    });
  });

  describe("source dataset files", () => {
    it("should pass when source dataset file exists on the specified atlas via source dataset", async () => {
      // Use existing test file that's linked to source dataset
      const fileId = SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id;
      const atlasId = ATLAS_WITH_MISC_SOURCE_STUDIES.id;

      // Should not throw an error
      await expect(
        confirmFileExistsOnAtlas(fileId, atlasId)
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError when source dataset exists but on different atlas", async () => {
      // Use existing test file linked to one atlas, but check against different atlas
      const fileId = SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id;
      const wrongAtlasId = ATLAS_DRAFT.id;

      // Should throw NotFoundError when checking for different atlas
      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId)
      ).rejects.toThrow(
        `No files exist on atlas with ID ${wrongAtlasId} with ID(s): ${SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id}`
      );
    });

    it("should throw NotFoundError when source dataset exists on a source study of the atlas but is not linked to the atlas", async () => {
      const fileId = FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.id;
      const nonLinkedAtlasId = ATLAS_WITH_MISC_SOURCE_STUDIES.id;

      await expect(
        confirmFileExistsOnAtlas(fileId, nonLinkedAtlasId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(fileId, nonLinkedAtlasId)
      ).rejects.toThrow(
        `No files exist on atlas with ID ${nonLinkedAtlasId} with ID(s): ${FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.id}`
      );
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
      ).rejects.toThrow(`No files exist with ID(s): ${nonExistentFileId}`);
    });

    it("should throw NotFoundError when file exists but doesn't match criteria", async () => {
      // Create an orphan file that doesn't match either condition (no component_atlas_id and no source_dataset_id)
      const testFileId = "550e8400-e29b-41d4-a716-446655440011";

      await createTestFile(testFileId, {
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
      ).rejects.toThrow(`No files exist with ID(s): ${nonExistentFileId}`);
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
      const fileId = COMPONENT_ATLAS_DRAFT_FOO.file.id;

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
  const SELECT_FILE_QUERY =
    "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2";

  beforeEach(async () => {
    await resetDatabase();
  });

  describe("successful operations", () => {
    it("should insert a new file record", async () => {
      const mockFileData = {
        atlasId: ATLAS_DRAFT.id,
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
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: TEST_VERSION_ID,
      };

      const result = await doTransaction(async (transaction) => {
        return await upsertFileRecord(mockFileData, transaction);
      });

      const EXPECTED_OPERATION = "inserted";
      const EXPECTED_ETAG = TEST_ETAG; // Should match the input etag

      expect(result).not.toBeNull();
      expect(result!.operation).toBe(EXPECTED_OPERATION);
      expect(result!.etag).toBe(EXPECTED_ETAG);

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
        atlasId: ATLAS_DRAFT.id,
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
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
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

      expect(result).not.toBeNull();
      expect(result!.operation).toBe("updated");
      expect(result!.etag).toBe(TEST_ETAG);

      // Verify only one record exists
      const queryResult = await query(SELECT_FILE_QUERY, [
        fileData.bucket,
        fileData.key,
      ]);
      expect(queryResult.rows).toHaveLength(1);
    });

    it("should handle null values correctly", async () => {
      const fileData = {
        atlasId: null,
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
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: null, // This should be allowed
      };

      const result = await doTransaction(async (transaction) => {
        return await upsertFileRecord(fileData, transaction);
      });

      expect(result).not.toBeNull();
      expect(result!.operation).toBe("inserted");
      expect(result!.etag).toBe(TEST_ETAG_ALT);

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
    it("should throw ETagMismatchError when ETag differs", async () => {
      const originalFileData = {
        atlasId: ATLAS_DRAFT.id,
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
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: "test-version-123",
      };

      // Insert original file
      await doTransaction(async (transaction) => {
        return await upsertFileRecord(originalFileData, transaction);
      });

      // Try to update with different ETag (upsertFileRecord now throws on mismatch)
      const conflictingFileData = {
        ...originalFileData,
        etag: "different-etag", // Different ETag indicates potential corruption
        snsMessageId: originalFileData.snsMessageId, // Same SNS message ID to trigger conflict
      };

      // Should throw ETagMismatchError with both existing and new ETags in the message
      try {
        await doTransaction(async (transaction) => {
          return await upsertFileRecord(conflictingFileData, transaction);
        });
        // If we get here, test should fail
        throw new Error("Expected ETagMismatchError to be thrown");
      } catch (e: unknown) {
        const err = e as Error;
        expect(err).toBeInstanceOf(ETagMismatchError);
        expect(err.message).toContain("existing=original-etag");
        expect(err.message).toContain("new=different-etag");
      }

      // Verify original record unchanged
      const queryResult = await query(
        "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
        [originalFileData.bucket, originalFileData.key]
      );
      expect(queryResult.rows[0].etag).toBe("original-etag");
    });
  });
});

describe("markPreviousVersionsAsNotLatest", () => {
  // Test constants for this describe block
  const SELECT_IS_LATEST_QUERY =
    "SELECT is_latest FROM hat.files WHERE bucket = $1 AND key = $2";

  beforeEach(async () => {
    await resetDatabase();
  });

  it("should return 0 for new file (no previous versions)", async () => {
    const bucket = "test-bucket-new";
    const key = "test/path/new-file.h5ad";

    const rowsUpdated = await doTransaction(async (transaction) => {
      return await markPreviousVersionsAsNotLatest(bucket, key, transaction);
    });

    expect(rowsUpdated).toBe(0);
  });

  it("should return count of updated rows for existing file with previous versions", async () => {
    const bucket = "test-bucket-existing";
    const key = "test/path/existing-file.h5ad";

    // Create multiple versions of the same file
    await doTransaction(async (transaction) => {
      // Insert first version
      await upsertTestFile(
        {
          bucket,
          componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
          etag: "etag-v1",
          eventInfo: TEST_EVENT_INFO,
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          integrityStatus: INTEGRITY_STATUS.PENDING,
          key,
          sha256Client: null,
          sizeBytes: 1024,
          snsMessageId: "sns-message-v1",
          sourceDatasetId: null,
          validationStatus: FILE_VALIDATION_STATUS.PENDING,
          versionId: "version-1",
        },
        transaction
      );

      // Insert second version
      await upsertTestFile(
        {
          bucket,
          componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
          etag: "etag-v2",
          eventInfo: TEST_EVENT_INFO,
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          integrityStatus: INTEGRITY_STATUS.PENDING,
          key,
          sha256Client: null,
          sizeBytes: 2048,
          snsMessageId: "sns-message-v2",
          sourceDatasetId: null,
          validationStatus: FILE_VALIDATION_STATUS.PENDING,
          versionId: "version-2",
        },
        transaction
      );
    });

    // Now mark previous versions as not latest
    const rowsUpdated = await doTransaction(async (transaction) => {
      return await markPreviousVersionsAsNotLatest(bucket, key, transaction);
    });

    // Should have updated 2 rows (both previous versions)
    expect(rowsUpdated).toBe(2);

    // Verify all versions are now marked as not latest
    const queryResult = await query(SELECT_IS_LATEST_QUERY, [bucket, key]);
    expect(queryResult.rows).toHaveLength(2);
    expect(queryResult.rows.every((row) => row.is_latest === false)).toBe(true);
  });

  it("should only affect files with matching bucket and key", async () => {
    const bucket1 = "test-bucket-1";
    const bucket2 = "test-bucket-2";
    const key1 = "test/path/file1.h5ad";
    const key2 = "test/path/file2.h5ad";

    // Create files in different buckets and with different keys
    await doTransaction(async (transaction) => {
      await upsertTestFile(
        {
          bucket: bucket1,
          componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
          etag: "etag-1",
          eventInfo: TEST_EVENT_INFO,
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          integrityStatus: INTEGRITY_STATUS.PENDING,
          key: key1,
          sha256Client: null,
          sizeBytes: 1024,
          snsMessageId: "sns-message-1",
          sourceDatasetId: null,
          validationStatus: FILE_VALIDATION_STATUS.PENDING,
          versionId: "version-1",
        },
        transaction
      );

      await upsertTestFile(
        {
          bucket: bucket2,
          componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
          etag: "etag-2",
          eventInfo: TEST_EVENT_INFO,
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          integrityStatus: INTEGRITY_STATUS.PENDING,
          key: key2,
          sha256Client: null,
          sizeBytes: 1024,
          snsMessageId: "sns-message-2",
          sourceDatasetId: null,
          validationStatus: FILE_VALIDATION_STATUS.PENDING,
          versionId: "version-2",
        },
        transaction
      );
    });

    // Mark previous versions as not latest for bucket1/key1 only
    const rowsUpdated = await doTransaction(async (transaction) => {
      return await markPreviousVersionsAsNotLatest(bucket1, key1, transaction);
    });

    // Should have updated only 1 row
    expect(rowsUpdated).toBe(1);

    // Verify only the matching file was affected
    const bucket1Result = await query(SELECT_IS_LATEST_QUERY, [bucket1, key1]);
    expect(bucket1Result.rows[0].is_latest).toBe(false);

    const bucket2Result = await query(SELECT_IS_LATEST_QUERY, [bucket2, key2]);
    expect(bucket2Result.rows[0].is_latest).toBe(true);
  });
});

describe("getExistingMetadataObjectId", () => {
  // Test constants
  const TEST_BUCKET = "test-bucket-metadata";
  const TEST_KEY_INTEGRATED = "test/path/integrated-object.h5ad";
  const TEST_KEY_SOURCE_DATASET = "test/path/source-dataset.h5ad";

  beforeEach(async () => {
    await resetDatabase();
  });

  describe("integrated object files", () => {
    it("should return component atlas ID for existing integrated object file", async () => {
      // First create a file record with component atlas ID
      await upsertTestFile({
        bucket: TEST_BUCKET,
        componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
        etag: "test-etag-integrated",
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INTEGRATED_OBJECT,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY_INTEGRATED,
        sha256Client: null,
        sizeBytes: 2048,
        snsMessageId: "test-sns-integrated",
        sourceDatasetId: null,
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: "test-version-integrated",
      });

      // Now test getExistingMetadataObjectId
      const result = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          TEST_KEY_INTEGRATED,
          transaction
        );
      });

      expect(result).toBe(COMPONENT_ATLAS_DRAFT_FOO.id);
    });

    it("should return null for non-existent integrated object file", async () => {
      const result = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          "non/existent/file.h5ad",
          transaction
        );
      });

      expect(result).toBeNull();
    });

    it("should return null for integrated object file that is not latest", async () => {
      // Create two versions of the same file
      await doTransaction(async (transaction) => {
        // First version
        await upsertTestFile(
          {
            bucket: TEST_BUCKET,
            componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
            etag: "test-etag-v1",
            eventInfo: TEST_EVENT_INFO,
            fileType: FILE_TYPE.INTEGRATED_OBJECT,
            integrityStatus: INTEGRITY_STATUS.PENDING,
            key: TEST_KEY_INTEGRATED,
            sha256Client: null,
            sizeBytes: 1024,
            snsMessageId: "test-sns-1",
            sourceDatasetId: null,
            validationStatus: FILE_VALIDATION_STATUS.PENDING,
            versionId: "test-version-v1",
          },
          transaction
        );

        // Second version (this will mark the first as not latest)
        await upsertTestFile(
          {
            bucket: TEST_BUCKET,
            componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
            etag: "test-etag-v2",
            eventInfo: TEST_EVENT_INFO,
            fileType: FILE_TYPE.INTEGRATED_OBJECT,
            integrityStatus: INTEGRITY_STATUS.PENDING,
            key: TEST_KEY_INTEGRATED,
            sha256Client: null,
            sizeBytes: 2048,
            snsMessageId: "test-sns-2",
            sourceDatasetId: null,
            validationStatus: FILE_VALIDATION_STATUS.PENDING,
            versionId: "test-version-2",
          },
          transaction
        );
      });

      // Mark all versions as not latest
      await doTransaction(async (transaction) => {
        await markPreviousVersionsAsNotLatest(
          TEST_BUCKET,
          TEST_KEY_INTEGRATED,
          transaction
        );
      });

      // Should return null since no version is marked as latest
      const result = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          TEST_KEY_INTEGRATED,
          transaction
        );
      });

      expect(result).toBeNull();
    });
  });

  describe("source dataset files", () => {
    it("should return source dataset ID for existing source dataset file", async () => {
      // First create a file record with source dataset ID
      await upsertTestFile({
        bucket: TEST_BUCKET,
        componentAtlasId: null,
        etag: "test-etag-source",
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.SOURCE_DATASET,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY_SOURCE_DATASET,
        sha256Client: null,
        sizeBytes: 1024,
        snsMessageId: "test-sns-source",
        sourceDatasetId: SOURCE_DATASET_DRAFT_OK_FOO.id,
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: "test-version-source",
      });

      // Now test getExistingMetadataObjectId
      const result = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          TEST_KEY_SOURCE_DATASET,
          transaction
        );
      });

      expect(result).toBe(SOURCE_DATASET_DRAFT_OK_FOO.id);
    });

    it("should return null for non-existent source dataset file", async () => {
      const result = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          "non/existent/dataset.h5ad",
          transaction
        );
      });

      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle different file types correctly", async () => {
      // Create files of different types with the same bucket/key pattern
      const baseKey = "test/path/file";
      await doTransaction(async (transaction) => {
        // Integrated object file
        await upsertTestFile(
          {
            bucket: TEST_BUCKET,
            componentAtlasId: COMPONENT_ATLAS_DRAFT_FOO.id,
            etag: "test-etag-integrated",
            eventInfo: TEST_EVENT_INFO,
            fileType: FILE_TYPE.INTEGRATED_OBJECT,
            integrityStatus: INTEGRITY_STATUS.PENDING,
            key: `${baseKey}.h5ad`,
            sha256Client: null,
            sizeBytes: 1024,
            snsMessageId: "test-sns-integrated",
            sourceDatasetId: null,
            validationStatus: FILE_VALIDATION_STATUS.PENDING,
            versionId: "test-version-integrated",
          },
          transaction
        );

        // Source dataset file
        await upsertTestFile(
          {
            bucket: TEST_BUCKET,
            componentAtlasId: null,
            etag: "test-etag-source",
            eventInfo: TEST_EVENT_INFO,
            fileType: FILE_TYPE.SOURCE_DATASET,
            integrityStatus: INTEGRITY_STATUS.PENDING,
            key: `${baseKey}-dataset.h5ad`,
            sha256Client: null,
            sizeBytes: 2048,
            snsMessageId: "test-sns-source",
            sourceDatasetId: SOURCE_DATASET_DRAFT_OK_FOO.id,
            validationStatus: FILE_VALIDATION_STATUS.PENDING,
            versionId: "test-version-source",
          },
          transaction
        );
      });

      // Test integrated object lookup
      const integratedResult = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          `${baseKey}.h5ad`,
          transaction
        );
      });

      // Test source dataset lookup
      const sourceResult = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          `${baseKey}-dataset.h5ad`,
          transaction
        );
      });

      expect(integratedResult).toBe(COMPONENT_ATLAS_DRAFT_FOO.id);
      expect(sourceResult).toBe(SOURCE_DATASET_DRAFT_OK_FOO.id);
    });

    it("should return null for unsupported file types", async () => {
      // Create a file with an unsupported file type
      await upsertTestFile({
        bucket: TEST_BUCKET,
        componentAtlasId: null,
        etag: "test-etag-manifest",
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INGEST_MANIFEST,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: "test/path/manifest.json",
        sha256Client: null,
        sizeBytes: 512,
        snsMessageId: "test-sns-manifest",
        sourceDatasetId: null,
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
        versionId: "test-version-manifest",
      });

      // Should return null for unsupported file type
      const result = await doTransaction(async (transaction) => {
        return await getExistingMetadataObjectId(
          TEST_BUCKET,
          "test/path/manifest.json",
          transaction
        );
      });

      expect(result).toBeNull();
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
          "nonexistent-network" as NetworkKey,
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

async function upsertTestFile(
  fileData: TestFileUpsertData,
  client?: pg.PoolClient
): Promise<void> {
  await doOrContinueTransaction(client, async (client) => {
    const fileResult = await upsertFileRecord(fileData, client);
    if (typeof fileData.componentAtlasId === "string") {
      await client.query(
        "UPDATE hat.component_atlases SET file_id = $1 WHERE id = $2",
        [fileResult.id, fileData.componentAtlasId]
      );
    } else if (typeof fileData.sourceDatasetId === "string") {
      await client.query(
        "UPDATE hat.source_datasets SET file_id = $1 WHERE id = $2",
        [fileResult.id, fileData.sourceDatasetId]
      );
    }
  });
}
