import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getBucketFileKeys } from "app/services/s3-sync";
import { mockClient } from "aws-sdk-client-mock";
import { TEST_S3_BUCKET } from "testing/constants";
import { withConsoleMessageHiding } from "testing/utils";

jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

const s3Mock = mockClient(S3Client);

beforeEach(() => s3Mock.reset());

describe("getBucketFileKeys", () => {
  it("Uses pagination", async () => {
    // Setup

    const TEST_PAGE_SIZE = 20;
    const TEST_NUM_KEYS = 55;

    const pagesKeys: string[][] = [[]];

    for (let i = 0; i < TEST_NUM_KEYS; i++) {
      if (pagesKeys[pagesKeys.length - 1].length === TEST_PAGE_SIZE)
        pagesKeys.push([]);
      pagesKeys[pagesKeys.length - 1].push(
        `gut/gut-v1/source-datasets/test-${i}.h5ad`
      );
    }

    for (const [i, pageKeys] of pagesKeys.entries()) {
      s3Mock
        .on(ListObjectsV2Command, {
          ContinuationToken: i ? `test-continuation-${i}` : undefined,
        })
        .resolves({
          Contents: pageKeys.map((key) => ({ Key: key })),
          IsTruncated: i < pagesKeys.length - 1,
          NextContinuationToken:
            i < pagesKeys.length - 1 ? `test-continuation-${i + 1}` : undefined,
        });
    }

    // Test pagination

    let resultKeys: string[] = [];

    await withConsoleMessageHiding(
      async () => {
        resultKeys = await getBucketFileKeys(TEST_S3_BUCKET, new S3Client());
      },
      true,
      undefined,
      ["log"]
    );

    expect(resultKeys).toEqual(pagesKeys.flat());

    expect(new Set(resultKeys).size).toEqual(TEST_NUM_KEYS);
  });
});
