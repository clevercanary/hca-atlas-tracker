import {
  ATLAS_WITH_MISC_SOURCE_STUDIES,
  CELLXGENE_DATASET_NEW,
  CELLXGENE_DATASET_WITH_UPDATE_UPDATED,
  COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
  SOURCE_DATASET_FOO,
  SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR,
  SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
  SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID,
  SOURCE_STUDY_WITH_SOURCE_DATASETS,
} from "testing/constants";
import {
  HCAAtlasTrackerDBSourceDataset,
  HCAAtlasTrackerDBSourceDatasetInfo,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool, query } from "../app/services/database";
import { updateCellxGeneSourceDatasets } from "../app/services/source-datasets";
import { CellxGeneDataset } from "../app/utils/cellxgene-api";
import {
  getAtlasFromDatabase,
  getComponentAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestSourceDataset } from "../testing/entities";
import {
  expectAtlasDatasetsToHaveDifference,
  expectComponentAtlasDatasetsToHaveDifference,
  expectIsDefined,
} from "../testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("updateCellxGeneSourceDatasets", () => {
  it("updates, adds, and deletes source datasets as appropriate, including on linked entities, and only changing necessary fields on update", async () => {
    const sourceDatasetsBefore = await getStudySourceDatasets(
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id
    );
    const pwciSourceDatasetsBefore = await getStudySourceDatasets(
      SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID.id
    );

    expect(sourceDatasetsBefore).toHaveLength(8);
    expect(pwciSourceDatasetsBefore).toHaveLength(2);

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
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
      ["metadataSpreadsheetTitle", "metadataSpreadsheetUrl"]
    );
    expect(
      findSourceDatasetByCellxGeneId(
        sourceDatasetsBefore,
        CELLXGENE_DATASET_NEW.dataset_id
      )
    ).toBeUndefined();

    expectSourceDatasetToMatch(
      findSourceDatasetById(
        pwciSourceDatasetsBefore,
        SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO.id
      ),
      SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO
    );
    expectSourceDatasetToMatch(
      findSourceDatasetById(
        pwciSourceDatasetsBefore,
        SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR.id
      ),
      SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR
    );

    const atlasBefore = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );
    const componentAtlasBefore = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS.id
    );

    await updateCellxGeneSourceDatasets();

    const sourceDatasetsAfter = await getStudySourceDatasets(
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id
    );
    const pwciSourceDatasetsAfter = await getStudySourceDatasets(
      SOURCE_STUDY_PUBLISHED_WITHOUT_CELLXGENE_ID.id
    );

    expect(sourceDatasetsAfter).toHaveLength(9);
    expect(pwciSourceDatasetsAfter).toHaveLength(1);

    expectSourceDatasetToMatch(
      findSourceDatasetById(
        sourceDatasetsAfter,
        SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE.id
      ),
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE
    );
    expectNewOrUpdatedDatasetToMatch(
      findSourceDatasetById(
        sourceDatasetsAfter,
        SOURCE_DATASET_CELLXGENE_WITH_UPDATE.id
      ),
      CELLXGENE_DATASET_WITH_UPDATE_UPDATED,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id,
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE
    );
    expectNewOrUpdatedDatasetToMatch(
      findSourceDatasetByCellxGeneId(
        sourceDatasetsAfter,
        CELLXGENE_DATASET_NEW.dataset_id
      ),
      CELLXGENE_DATASET_NEW,
      SOURCE_STUDY_WITH_SOURCE_DATASETS.id
    );

    expect(
      findSourceDatasetById(
        pwciSourceDatasetsAfter,
        SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO.id
      )
    ).toBeUndefined();
    expectSourceDatasetToMatch(
      findSourceDatasetById(
        pwciSourceDatasetsAfter,
        SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR.id
      ),
      SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_BAR
    );

    expectSourceDatasetToMatch(
      findSourceDatasetById(sourceDatasetsAfter, SOURCE_DATASET_FOO.id),
      SOURCE_DATASET_FOO
    );

    const atlasAfter = await getAtlasFromDatabase(
      ATLAS_WITH_MISC_SOURCE_STUDIES.id
    );
    const componentAtlasAfter = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_WITH_CELLXGENE_DATASETS.id
    );

    if (
      !(
        expectIsDefined(atlasBefore) &&
        expectIsDefined(atlasAfter) &&
        expectIsDefined(componentAtlasBefore) &&
        expectIsDefined(componentAtlasAfter)
      )
    ) {
      return;
    }
    expectAtlasDatasetsToHaveDifference(atlasAfter, atlasBefore, [
      SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO,
    ]);
    expectComponentAtlasDatasetsToHaveDifference(
      componentAtlasAfter,
      componentAtlasBefore,
      [SOURCE_DATASET_PUBLISHED_WITHOUT_CELLXGENE_ID_FOO]
    );
  });
});

function expectSourceDatasetToMatch(
  sourceDataset: HCAAtlasTrackerDBSourceDataset | undefined,
  testSourceDataset: TestSourceDataset,
  expectedNonNullInfoFields?: (keyof HCAAtlasTrackerDBSourceDatasetInfo)[]
): void {
  expect(sourceDataset).toBeDefined();
  if (!sourceDataset) return;
  expect(sourceDataset.source_study_id).toEqual(
    testSourceDataset.sourceStudyId
  );
  expect(sourceDataset.sd_info.assay).toEqual(testSourceDataset.assay ?? []);
  expect(sourceDataset.sd_info.cellCount).toEqual(
    testSourceDataset.cellCount ?? 0
  );
  expect(sourceDataset.sd_info.disease).toEqual(
    testSourceDataset.disease ?? []
  );
  expect(sourceDataset.sd_info.suspensionType).toEqual(
    testSourceDataset.suspensionType ?? []
  );
  expect(sourceDataset.sd_info.tissue).toEqual(testSourceDataset.tissue ?? []);
  expect(sourceDataset.sd_info.cellxgeneDatasetId).toEqual(
    testSourceDataset.cellxgeneDatasetId ?? null
  );
  expect(sourceDataset.sd_info.cellxgeneDatasetVersion).toEqual(
    testSourceDataset.cellxgeneDatasetVersion ?? null
  );
  expect(sourceDataset.sd_info.title).toEqual(testSourceDataset.title);
  if (expectedNonNullInfoFields) {
    expectedNonNullInfoFields.forEach((field) => {
      expect(sourceDataset.sd_info[field]).not.toBeNull();
    });
  }
}

function expectNewOrUpdatedDatasetToMatch(
  sourceDataset: HCAAtlasTrackerDBSourceDataset | undefined,
  cxgDataset: CellxGeneDataset,
  expectedSourceStudyId: string,
  existingDataset?: TestSourceDataset
): void {
  expect(sourceDataset).toBeDefined();
  if (!sourceDataset) return;
  expect(sourceDataset.source_study_id).toEqual(expectedSourceStudyId);
  expect(sourceDataset.sd_info.assay).toEqual(
    cxgDataset.assay.map((a) => a.label)
  );
  expect(sourceDataset.sd_info.cellCount).toEqual(cxgDataset.cell_count);
  expect(sourceDataset.sd_info.cellxgeneDatasetId).toEqual(
    cxgDataset.dataset_id
  );
  expect(sourceDataset.sd_info.cellxgeneDatasetVersion).toEqual(
    cxgDataset.dataset_version_id
  );
  expect(sourceDataset.sd_info.disease).toEqual(
    cxgDataset.disease.map((d) => d.label)
  );
  expect(sourceDataset.sd_info.cellxgeneExplorerUrl).toEqual(
    cxgDataset.explorer_url
  );
  expect(sourceDataset.sd_info.suspensionType).toEqual(
    cxgDataset.suspension_type
  );
  expect(sourceDataset.sd_info.tissue).toEqual(
    cxgDataset.tissue.map((t) => t.label)
  );
  expect(sourceDataset.sd_info.title).toEqual(cxgDataset.title);
  if (existingDataset) {
    expect(sourceDataset.sd_info.metadataSpreadsheetTitle).toEqual(
      existingDataset.metadataSpreadsheetTitle ?? null
    );
    expect(sourceDataset.sd_info.metadataSpreadsheetUrl).toEqual(
      existingDataset.metadataSpreadsheetUrl ?? null
    );
  } else {
    expect(sourceDataset.sd_info.metadataSpreadsheetTitle).toEqual(null);
    expect(sourceDataset.sd_info.metadataSpreadsheetUrl).toEqual(null);
  }
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
