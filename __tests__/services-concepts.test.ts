import { FILE_TYPE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getOrCreateConceptId } from "../app/services/concepts";
import { doTransaction, endPgPool } from "../app/services/database";
import { resetDatabase } from "../testing/db-utils";

jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase(false);
});

afterAll(async () => {
  await endPgPool();
});

describe("getOrCreateConceptId", () => {
  it("returns the same concept ID for the same info", async () => {
    const info = {
      atlas_short_name: "gut",
      base_filename: "same-file.h5ad",
      file_type: FILE_TYPE.SOURCE_DATASET,
      generation: 1,
      network: "gut",
    } as const;

    const [firstId, secondId] = await doTransaction(async (client) => {
      const id1 = await getOrCreateConceptId(info, client);
      const id2 = await getOrCreateConceptId(info, client);
      return [id1, id2];
    });

    expect(firstId).toBe(secondId);
  });

  it.each([
    {
      description: "different base filename",
      firstInfo: {
        atlas_short_name: "gut",
        base_filename: "file-a.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "gut",
      },
      secondInfo: {
        atlas_short_name: "gut",
        base_filename: "file-b.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "gut",
      },
    },
    {
      description: "different file type",
      firstInfo: {
        atlas_short_name: "gut",
        base_filename: "data.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "gut",
      },
      secondInfo: {
        atlas_short_name: "gut",
        base_filename: "data.h5ad",
        file_type: FILE_TYPE.INTEGRATED_OBJECT,
        generation: 1,
        network: "gut",
      },
    },
    {
      description: "different generation",
      firstInfo: {
        atlas_short_name: "gut",
        base_filename: "cells.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "gut",
      },
      secondInfo: {
        atlas_short_name: "gut",
        base_filename: "cells.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 2,
        network: "gut",
      },
    },
    {
      description: "different short name",
      firstInfo: {
        atlas_short_name: "test-short-name-a",
        base_filename: "test-file.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "heart",
      },
      secondInfo: {
        atlas_short_name: "test-short-name-b",
        base_filename: "test-file.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "heart",
      },
    },
    {
      description: "different network",
      firstInfo: {
        atlas_short_name: "test-short-name-a",
        base_filename: "test-file.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "heart",
      },
      secondInfo: {
        atlas_short_name: "test-short-name-a",
        base_filename: "test-file.h5ad",
        file_type: FILE_TYPE.SOURCE_DATASET,
        generation: 1,
        network: "lung",
      },
    },
  ] as const)(
    "creates different concepts for info with $description",
    async ({ firstInfo, secondInfo }) => {
      const [firstId, secondId] = await doTransaction(async (client) => {
        const id1 = await getOrCreateConceptId(firstInfo, client);
        const id2 = await getOrCreateConceptId(secondInfo, client);
        return [id1, id2];
      });

      expect(firstId).not.toBe(secondId);
    },
  );
});
