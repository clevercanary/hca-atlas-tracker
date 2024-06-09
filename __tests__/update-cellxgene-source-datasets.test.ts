import {
  CELLXGENE_DATASET_NEW,
  CELLXGENE_DATASET_WITH_UPDATE_UPDATED,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_STUDY_WITH_SOURCE_DATASETS,
} from "testing/constants";
import { HCAAtlasTrackerDBSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool, query } from "../app/services/database";
import { updateCellxGeneSourceDatasets } from "../app/services/source-datasets";
import { CellxGeneDataset } from "../app/utils/cellxgene-api";
import { resetDatabase } from "../testing/db-utils";
import { TestSourceDataset } from "../testing/entities";

jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("updateCellxGeneSourceDatasets", () => {
  it("updates and adds source datasets as appropriate", async () => {
    const sourceDatasetsBefore = await getStudySourceDatasets(
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id
    );

    expect(sourceDatasetsBefore).toHaveLength(8);

    expectSourceDatasetToMatch(
      findSourceDatasetById(
        sourceDatasetsBefore,
        SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.id
      ),
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE
    );
    expectSourceDatasetToMatch(
      findSourceDatasetById(
        sourceDatasetsBefore,
        SOURCE_DATASET_CELLXGENE_WITH_UPDATE.id
      ),
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE
    );
    expect(
      findSourceDatasetByCellxGeneId(
        sourceDatasetsBefore,
        CELLXGENE_DATASET_NEW.dataset_id
      )
    ).toBeUndefined();

    await updateCellxGeneSourceDatasets();

    const sourceDatasetsAfter = await getStudySourceDatasets(
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id
    );

    expect(sourceDatasetsAfter).toHaveLength(9);

    expectSourceDatasetToMatch(
      findSourceDatasetById(
        sourceDatasetsAfter,
        SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.id
      ),
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE
    );
    expectSourceDatasetToMatchCellxGeneDataset(
      findSourceDatasetById(
        sourceDatasetsAfter,
        SOURCE_DATASET_CELLXGENE_WITH_UPDATE.id
      ),
      CELLXGENE_DATASET_WITH_UPDATE_UPDATED,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id
    );
    expectSourceDatasetToMatchCellxGeneDataset(
      findSourceDatasetByCellxGeneId(
        sourceDatasetsAfter,
        CELLXGENE_DATASET_NEW.dataset_id
      ),
      CELLXGENE_DATASET_NEW,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id
    );

    expectSourceDatasetToMatch(
      findSourceDatasetById(sourceDatasetsAfter, SOURCE_DATASET_FOO.id),
      SOURCE_DATASET_FOO
    );
  });
});

function expectSourceDatasetToMatch(
  sourceDataset: HCAAtlasTrackerDBSourceDataset | undefined,
  testSourceDataset: TestSourceDataset
): void {
  expect(sourceDataset).toBeDefined();
  if (!sourceDataset) return;
  expect(sourceDataset.source_study_id).toEqual(
    testSourceDataset.sourceStudyId
  );
  expect(sourceDataset.sd_info.cellCount).toEqual(0);
  expect(sourceDataset.sd_info.cellxgeneDatasetId).toEqual(
    testSourceDataset.cellxgeneDatasetId ?? null
  );
  expect(sourceDataset.sd_info.cellxgeneDatasetVersion).toEqual(
    testSourceDataset.cellxgeneDatasetVersion ?? null
  );
  expect(sourceDataset.sd_info.title).toEqual(testSourceDataset.title);
}

function expectSourceDatasetToMatchCellxGeneDataset(
  sourceDataset: HCAAtlasTrackerDBSourceDataset | undefined,
  cxgDataset: CellxGeneDataset,
  expectedSourceStudyId: string
): void {
  expect(sourceDataset).toBeDefined();
  if (!sourceDataset) return;
  expect(sourceDataset.source_study_id).toEqual(expectedSourceStudyId);
  expect(sourceDataset.sd_info.cellCount).toEqual(cxgDataset.cell_count);
  expect(sourceDataset.sd_info.cellxgeneDatasetId).toEqual(
    cxgDataset.dataset_id
  );
  expect(sourceDataset.sd_info.cellxgeneDatasetVersion).toEqual(
    cxgDataset.dataset_version_id
  );
  expect(sourceDataset.sd_info.title).toEqual(cxgDataset.title);
}

function findSourceDatasetById(
  sourceDatasets: HCAAtlasTrackerDBSourceDataset[],
  id: string
): HCAAtlasTrackerDBSourceDataset | undefined {
  return sourceDatasets.find((d) => d.id === id);
}

function findSourceDatasetByCellxGeneId(
  sourceDatasets: HCAAtlasTrackerDBSourceDataset[],
  id: string
): HCAAtlasTrackerDBSourceDataset | undefined {
  return sourceDatasets.find((d) => d.sd_info.cellxgeneDatasetId === id);
}

async function getStudySourceDatasets(
  studyId: string
): Promise<HCAAtlasTrackerDBSourceDataset[]> {
  return (
    await query<HCAAtlasTrackerDBSourceDataset>(
      "SELECT * FROM hat.source_datasets WHERE source_study_id=$1",
      [studyId]
    )
  ).rows;
}
