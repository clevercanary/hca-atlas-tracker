import { ETagMismatchError } from "../app/apis/catalog/hca-atlas-tracker/aws/errors";
import {
  FILE_TYPE,
  FILE_VALIDATION_STATUS,
  INTEGRITY_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  confirmFileExistsOnAtlas,
  markPreviousVersionsAsNotLatest,
  upsertFileRecord,
} from "../app/data/files";
import { doTransaction, endPgPool, query } from "../app/services/database";
import { NotFoundError } from "../app/utils/api-handler";
import {
  ATLAS_DRAFT,
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  COMPONENT_ATLAS_DRAFT_FOO,
  FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES,
  SOURCE_DATASET_ATLAS_LINKED_A_FOO,
  SOURCE_DATASET_DRAFT_OK_FOO,
} from "../testing/constants";
import {
  createTestConceptFromS3Key,
  createTestFile,
  resetDatabase,
} from "../testing/db-utils";

// Shared test constants
const TEST_EVENT_INFO = JSON.stringify({
  eventName: "s3:ObjectCreated:Put",
  eventTime: "2023-01-01T00:00:00.000Z",
});

// Mock external dependencies
jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("next-auth");

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await query(
    "DELETE FROM hat.files f WHERE f.file_type = 'integrated_object' AND NOT EXISTS (SELECT 1 FROM hat.component_atlases c WHERE c.file_id = f.id)",
  );
  await query(
    "DELETE FROM hat.files f WHERE f.file_type = 'source_dataset' AND NOT EXISTS (SELECT 1 FROM hat.source_datasets c WHERE c.file_id = f.id)",
  );
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
        confirmFileExistsOnAtlas(fileId, atlasId),
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError when file exists but on different atlas", async () => {
      // Use existing test file linked to one atlas, but check against different atlas
      const fileId = COMPONENT_ATLAS_DRAFT_FOO.file.id;
      const wrongAtlasId = ATLAS_WITH_MISC_SOURCE_STUDIES.id;

      // Should throw NotFoundError when checking for different atlas
      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId),
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId),
      ).rejects.toThrow(
        `No files exist on atlas with ID ${wrongAtlasId} with ID(s): ${COMPONENT_ATLAS_DRAFT_FOO.file.id}`,
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
        confirmFileExistsOnAtlas(fileId, atlasId),
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError when source dataset exists but on different atlas", async () => {
      // Use existing test file linked to one atlas, but check against different atlas
      const fileId = SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id;
      const wrongAtlasId = ATLAS_DRAFT.id;

      // Should throw NotFoundError when checking for different atlas
      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId),
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(fileId, wrongAtlasId),
      ).rejects.toThrow(
        `No files exist on atlas with ID ${wrongAtlasId} with ID(s): ${SOURCE_DATASET_ATLAS_LINKED_A_FOO.file.id}`,
      );
    });

    it("should throw NotFoundError when source dataset exists on a source study of the atlas but is not linked to the atlas", async () => {
      const fileId = FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.id;
      const nonLinkedAtlasId = ATLAS_WITH_MISC_SOURCE_STUDIES.id;

      await expect(
        confirmFileExistsOnAtlas(fileId, nonLinkedAtlasId),
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(fileId, nonLinkedAtlasId),
      ).rejects.toThrow(
        `No files exist on atlas with ID ${nonLinkedAtlasId} with ID(s): ${FILE_C_SOURCE_DATASET_WITH_MULTIPLE_FILES.id}`,
      );
    });
  });

  describe("error cases", () => {
    it("should throw NotFoundError when file doesn't exist", async () => {
      const nonExistentFileId = "550e8400-e29b-41d4-a716-446655440099";

      await expect(
        confirmFileExistsOnAtlas(nonExistentFileId, ATLAS_DRAFT.id),
      ).rejects.toThrow(NotFoundError);

      await expect(
        confirmFileExistsOnAtlas(nonExistentFileId, ATLAS_DRAFT.id),
      ).rejects.toThrow(`No files exist with ID(s): ${nonExistentFileId}`);
    });

    it("should throw NotFoundError when file exists but doesn't match criteria", async () => {
      // Create an orphan file that doesn't match either condition (no component_atlas_id and no source_dataset_id)
      const testFileId = "550e8400-e29b-41d4-a716-446655440011";

      await createTestFile(testFileId, {
        bucket: "test-bucket-orphan",
        conceptId: null,
        etag: "550e8400-e29b-41d4-a716-test-etag2",
        fileType: FILE_TYPE.INGEST_MANIFEST,
        key: "test/atlas-v1/manifests/test.json",
        sizeBytes: 1024,
      });

      await expect(
        confirmFileExistsOnAtlas(testFileId, ATLAS_DRAFT.id),
      ).rejects.toThrow(NotFoundError);
    });

    it("should use standard error message", async () => {
      const nonExistentFileId = "550e8400-e29b-41d4-a716-446655440098";

      await expect(
        confirmFileExistsOnAtlas(nonExistentFileId, ATLAS_DRAFT.id),
      ).rejects.toThrow(`No files exist with ID(s): ${nonExistentFileId}`);
    });
  });

  describe("edge cases", () => {
    it("should handle invalid UUID format for file ID", async () => {
      // Test with invalid UUID format - should get database error, not NotFoundError
      await expect(
        confirmFileExistsOnAtlas("invalid-uuid", ATLAS_DRAFT.id),
      ).rejects.toThrow(); // Any error is fine, just not a successful resolution
    });

    it("should handle invalid UUID format for atlas ID", async () => {
      // Use existing test file
      const fileId = COMPONENT_ATLAS_DRAFT_FOO.file.id;

      // Should get database error due to invalid UUID format
      await expect(
        confirmFileExistsOnAtlas(fileId, "invalid-uuid"),
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
        conceptId: COMPONENT_ATLAS_DRAFT_FOO.id, // Valid UUID
        etag: TEST_ETAG,
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INTEGRATED_OBJECT,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY,
        sha256Client: TEST_SHA256,
        sizeBytes: TEST_SIZE_BYTES,
        snsMessageId: TEST_SNS_MESSAGE_ID,
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
        conceptId: COMPONENT_ATLAS_DRAFT_FOO.id, // Valid UUID for integrated_object
        etag: TEST_ETAG,
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INTEGRATED_OBJECT,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY,
        sha256Client: null,
        sizeBytes: TEST_SIZE_BYTES,
        snsMessageId: TEST_SNS_MESSAGE_ID,
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
        conceptId: SOURCE_DATASET_DRAFT_OK_FOO.id, // Valid UUID for source_dataset
        etag: TEST_ETAG_ALT,
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.SOURCE_DATASET,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: "test/path/dataset.h5ad",
        sha256Client: null, // This should be allowed
        sizeBytes: 2048,
        snsMessageId: "test-sns-message-789",
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
        conceptId: COMPONENT_ATLAS_DRAFT_FOO.id, // Valid UUID for integrated_object
        etag: "original-etag",
        eventInfo: TEST_EVENT_INFO,
        fileType: FILE_TYPE.INTEGRATED_OBJECT,
        integrityStatus: INTEGRITY_STATUS.PENDING,
        key: TEST_KEY,
        sha256Client: null,
        sizeBytes: TEST_SIZE_BYTES,
        snsMessageId: "original-sns-message",
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
        [originalFileData.bucket, originalFileData.key],
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
    const conceptId = "c574828f-d4b0-4a73-a402-fe7f9d65ca07";

    await createTestConceptFromS3Key(
      "heart/test-v1/integrated-objects/new-file.h5ad",
      conceptId,
    );

    const rowsUpdated = await doTransaction(async (transaction) => {
      return await markPreviousVersionsAsNotLatest(conceptId, transaction);
    });

    expect(rowsUpdated).toBe(0);
  });

  it("should return count of updated rows for existing file with previous versions", async () => {
    const bucket = "test-bucket-existing";
    const key = "heart/test-v1/integrated-objects/existing-file.h5ad";
    const conceptId = "a17f0bbb-b916-4c34-833d-e0437377afd6";

    // Create multiple versions of the same file
    await doTransaction(async (transaction) => {
      // Insert first version
      await createTestFile(
        "f089e3fd-8dfa-497d-b6d9-0d425d037824",
        {
          bucket,
          conceptId,
          etag: "etag-v1",
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          key,
          sizeBytes: 1024,
          versionId: "version-1",
        },
        transaction,
      );

      // Insert second version
      await createTestFile(
        "8976f453-c6cf-4ccd-881f-2655114ece63",
        {
          bucket,
          conceptId,
          etag: "etag-v2",
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          key,
          sizeBytes: 2048,
          versionId: "version-2",
        },
        transaction,
      );
    });

    // Now mark previous versions as not latest
    const rowsUpdated = await doTransaction(async (transaction) => {
      return await markPreviousVersionsAsNotLatest(conceptId, transaction);
    });

    // Should have updated 2 rows (both previous versions)
    expect(rowsUpdated).toBe(2);

    // Verify all versions are now marked as not latest
    const queryResult = await query(SELECT_IS_LATEST_QUERY, [bucket, key]);
    expect(queryResult.rows).toHaveLength(2);
    expect(queryResult.rows.every((row) => row.is_latest === false)).toBe(true);
  });

  it("should only affect files with matching concept ID", async () => {
    const bucket1 = "test-bucket-1";
    const bucket2 = "test-bucket-2";
    const key1 = "heart/test-v1/integrated-objects/file1.h5ad";
    const key2 = "heart/test-v1/integrated-objects/file2.h5ad";
    const conceptIdA = "a327e685-d565-423a-b60f-e12c4f7e4850";
    const conceptIdB = "4bba5b32-ff01-4929-92f8-4e8f8591cf5d";

    // Create files in different buckets and with different keys
    await doTransaction(async (transaction) => {
      await createTestFile(
        "4b130664-cafe-4141-9b3a-904eb3116427",
        {
          bucket: bucket1,
          conceptId: conceptIdA,
          etag: "etag-1",
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          key: key1,
          sizeBytes: 1024,
          versionId: "version-1",
        },
        transaction,
      );

      await createTestFile(
        "4b9c7c14-7eec-4e6e-827c-363794b9ba4a",
        {
          bucket: bucket2,
          conceptId: conceptIdB,
          etag: "etag-2",
          fileType: FILE_TYPE.INTEGRATED_OBJECT,
          key: key2,
          sizeBytes: 1024,
          versionId: "version-2",
        },
        transaction,
      );
    });

    // Mark previous versions as not latest for the first concept only
    const rowsUpdated = await doTransaction(async (transaction) => {
      return await markPreviousVersionsAsNotLatest(conceptIdA, transaction);
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
