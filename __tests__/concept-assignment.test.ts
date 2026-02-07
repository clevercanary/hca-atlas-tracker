import {
  createS3Event,
  createSNSMessage,
  createTestAtlasData,
  setUpAwsConfig,
  TEST_PATH_SEGMENTS,
  TEST_S3_BUCKET,
  TEST_SIGNATURE_VALID,
  TEST_TIMESTAMP,
  TEST_TIMESTAMP_ALT,
  TEST_VERSION_IDS,
  validateTestSnsMessage,
} from "../testing/sns-testing";

// Set up AWS resource configuration BEFORE any other imports
setUpAwsConfig();

import { NextApiRequest, NextApiResponse } from "next";
import httpMocks from "node-mocks-http";
import {
  FILE_TYPE,
  HCAAtlasTrackerDBConcept,
  HCAAtlasTrackerDBFile,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../app/common/entities";
import { resetConfigCache } from "../app/config/aws-resources";
import { endPgPool, query } from "../app/services/database";
import { resetDatabase } from "../testing/db-utils";
import { expectIsDefined, withConsoleMessageHiding } from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
);
jest.mock("../app/utils/crossref/crossref-api");
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/validator-batch");
jest.mock("next-auth");

jest.mock("sns-validator", () => {
  return jest.fn().mockImplementation(() => ({
    validate: jest.fn(validateTestSnsMessage),
  }));
});

afterEach(() => {
  resetConfigCache();
});

import snsHandler from "../pages/api/sns";

beforeEach(async () => {
  await resetDatabase(false);
  await createTestAtlasData();
});

afterAll(() => {
  endPgPool();
});

describe("Concept Assignment", () => {
  it("should assign concept_id to new source dataset file", async () => {
    const s3Event = createS3Event({
      etag: "concept-test-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      key: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/test-dataset-r1.h5ad`,
      size: 1024000,
      versionId: TEST_VERSION_IDS.DEFAULT,
    });

    const snsMessage = createSNSMessage({
      messageId: "concept-test-message-id-1",
      s3Event,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      },
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that file has concept_id assigned
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      "SELECT * FROM hat.files WHERE bucket = $1 AND key = $2",
      [
        TEST_S3_BUCKET,
        `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/test-dataset-r1.h5ad`,
      ],
    );

    expect(fileRows.rows).toHaveLength(1);
    const file = fileRows.rows[0];
    expect(file.concept_id).toBeDefined();
    expectIsDefined(file.concept_id);

    // Check that concept exists with correct attributes
    const conceptRows = await query<HCAAtlasTrackerDBConcept>(
      "SELECT * FROM hat.concepts WHERE id = $1",
      [file.concept_id],
    );

    expect(conceptRows.rows).toHaveLength(1);
    const concept = conceptRows.rows[0];
    expect(concept.atlas_short_name).toBe("gut");
    expect(concept.network).toBe("gut");
    expect(concept.generation).toBe(1);
    expect(concept.base_filename).toBe("test-dataset.h5ad"); // version suffix stripped
    expect(concept.file_type).toBe(FILE_TYPE.SOURCE_DATASET);
  });

  it("should reuse same concept for different versions of same file", async () => {
    // Upload first version with -r1 suffix
    const s3Event1 = createS3Event({
      etag: "concept-v1-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
      eventTime: TEST_TIMESTAMP,
      key: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/versioned-dataset-r1.h5ad`,
      size: 1024000,
      versionId: "version-1",
    });

    const snsMessage1 = createSNSMessage({
      messageId: "concept-test-message-v1",
      s3Event: s3Event1,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage1,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });

    expect(res1.statusCode).toBe(200);

    // Get concept_id from first file
    const file1Rows = await query<HCAAtlasTrackerDBFile>(
      "SELECT concept_id FROM hat.files WHERE bucket = $1 AND key = $2",
      [
        TEST_S3_BUCKET,
        `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/versioned-dataset-r1.h5ad`,
      ],
    );
    expect(file1Rows.rows).toHaveLength(1);
    const concept1Id = file1Rows.rows[0].concept_id;
    expectIsDefined(concept1Id);

    // Upload second version with -r2 suffix
    const s3Event2 = createS3Event({
      etag: "concept-v2-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2",
      eventTime: TEST_TIMESTAMP_ALT,
      key: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/versioned-dataset-r2.h5ad`,
      size: 2048000,
      versionId: "version-2",
    });

    const snsMessage2 = createSNSMessage({
      messageId: "concept-test-message-v2",
      s3Event: s3Event2,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP_ALT,
    });

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage2,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });

    expect(res2.statusCode).toBe(200);

    // Get concept_id from second file
    const file2Rows = await query<HCAAtlasTrackerDBFile>(
      "SELECT concept_id FROM hat.files WHERE bucket = $1 AND key = $2",
      [
        TEST_S3_BUCKET,
        `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/versioned-dataset-r2.h5ad`,
      ],
    );
    expect(file2Rows.rows).toHaveLength(1);
    const concept2Id = file2Rows.rows[0].concept_id;
    expectIsDefined(concept2Id);

    // Both files should have the same concept_id
    expect(concept1Id).toBe(concept2Id);

    // Verify only one concept exists for this base filename
    const conceptRows = await query<HCAAtlasTrackerDBConcept>(
      "SELECT * FROM hat.concepts WHERE base_filename = $1 AND file_type = $2",
      ["versioned-dataset.h5ad", FILE_TYPE.SOURCE_DATASET],
    );
    expect(conceptRows.rows).toHaveLength(1);
  });

  it("should create different concepts for different base filenames", async () => {
    // Upload first file
    const s3Event1 = createS3Event({
      etag: "concept-file1-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
      key: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/dataset-a-r1.h5ad`,
      size: 1024000,
      versionId: "file1-version",
    });

    const snsMessage1 = createSNSMessage({
      messageId: "concept-different-file-1",
      s3Event: s3Event1,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req: req1, res: res1 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage1,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req1, res1);
    });

    expect(res1.statusCode).toBe(200);

    // Upload second file with different base filename
    const s3Event2 = createS3Event({
      etag: "concept-file2-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2",
      key: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/dataset-b-r1.h5ad`,
      size: 2048000,
      versionId: "file2-version",
    });

    const snsMessage2 = createSNSMessage({
      messageId: "concept-different-file-2",
      s3Event: s3Event2,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req: req2, res: res2 } = httpMocks.createMocks<
      NextApiRequest,
      NextApiResponse
    >({
      body: snsMessage2,
      method: METHOD.POST,
    });

    await withConsoleMessageHiding(async () => {
      await snsHandler(req2, res2);
    });

    expect(res2.statusCode).toBe(200);

    // Get concept_ids from both files
    const file1Rows = await query<HCAAtlasTrackerDBFile>(
      "SELECT concept_id FROM hat.files WHERE bucket = $1 AND key = $2",
      [
        TEST_S3_BUCKET,
        `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/dataset-a-r1.h5ad`,
      ],
    );
    const file2Rows = await query<HCAAtlasTrackerDBFile>(
      "SELECT concept_id FROM hat.files WHERE bucket = $1 AND key = $2",
      [
        TEST_S3_BUCKET,
        `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/dataset-b-r1.h5ad`,
      ],
    );

    expect(file1Rows.rows).toHaveLength(1);
    expect(file2Rows.rows).toHaveLength(1);

    const concept1Id = file1Rows.rows[0].concept_id;
    const concept2Id = file2Rows.rows[0].concept_id;

    expectIsDefined(concept1Id);
    expectIsDefined(concept2Id);

    // Different files should have different concept_ids
    expect(concept1Id).not.toBe(concept2Id);
  });

  it("should strip -r1-wip-2 version suffix correctly", async () => {
    const s3Event = createS3Event({
      etag: "concept-wip-etag-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      key: `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/wip-dataset-r1-wip-2.h5ad`,
      size: 1024000,
      versionId: TEST_VERSION_IDS.DEFAULT,
    });

    const snsMessage = createSNSMessage({
      messageId: "concept-wip-message-id",
      s3Event,
      signature: TEST_SIGNATURE_VALID,
      timestamp: TEST_TIMESTAMP,
    });

    const { req, res } = httpMocks.createMocks<NextApiRequest, NextApiResponse>(
      {
        body: snsMessage,
        method: METHOD.POST,
      },
    );

    await withConsoleMessageHiding(async () => {
      await snsHandler(req, res);
    });

    expect(res.statusCode).toBe(200);

    // Check that concept has correct base_filename with version suffix stripped
    const fileRows = await query<HCAAtlasTrackerDBFile>(
      "SELECT concept_id FROM hat.files WHERE bucket = $1 AND key = $2",
      [
        TEST_S3_BUCKET,
        `${TEST_PATH_SEGMENTS.GUT_V1_SOURCE_DATASETS}/wip-dataset-r1-wip-2.h5ad`,
      ],
    );

    expect(fileRows.rows).toHaveLength(1);
    const conceptId = fileRows.rows[0].concept_id;
    expectIsDefined(conceptId);

    const conceptRows = await query<HCAAtlasTrackerDBConcept>(
      "SELECT * FROM hat.concepts WHERE id = $1",
      [conceptId],
    );

    expect(conceptRows.rows).toHaveLength(1);
    const concept = conceptRows.rows[0];
    expect(concept.base_filename).toBe("wip-dataset.h5ad"); // -r1-wip-2 stripped
  });
});
