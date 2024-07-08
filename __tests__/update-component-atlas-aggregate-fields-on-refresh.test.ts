import { HCAAtlasTrackerDBComponentAtlas } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { endPgPool } from "../app/services/database";
import { doUpdatesIfRefreshesComplete } from "../app/services/refresh-services";
import { CellxGeneDataset } from "../app/utils/cellxgene-api";
import {
  CELLXGENE_DATASET_WITH_UPDATE_UPDATED,
  COMPONENT_ATLAS_DRAFT_BAR,
  COMPONENT_ATLAS_DRAFT_FOO,
  SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE,
  SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
} from "../testing/constants";
import {
  getComponentAtlasFromDatabase,
  resetDatabase,
} from "../testing/db-utils";
import { TestSourceDataset } from "../testing/entities";
import { expectIsDefined } from "../testing/utils";

jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/services/user-profile");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/source-studies");
jest.mock("../app/services/validations");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(() => {
  endPgPool();
});

describe("doUpdatesIfRefreshesComplete", () => {
  it("updates fields of component atlases that have updated cellxgene source datasets", async () => {
    const caDraftBarBefore = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_BAR.id
    );
    const caDraftFooBefore = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );

    if (!expectIsDefined(caDraftBarBefore)) return;

    expectSourceDatasetValues(
      caDraftBarBefore,
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE
    );
    expectSourceDatasetValues(
      caDraftBarBefore,
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE
    );
    expectCellxGeneDatasetValues(
      caDraftBarBefore,
      CELLXGENE_DATASET_WITH_UPDATE_UPDATED,
      true
    );

    await doUpdatesIfRefreshesComplete();

    const caDraftBarAfter = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_BAR.id
    );
    const caDraftFooAfter = await getComponentAtlasFromDatabase(
      COMPONENT_ATLAS_DRAFT_FOO.id
    );

    if (!expectIsDefined(caDraftBarAfter)) return;

    expectSourceDatasetValues(
      caDraftBarAfter,
      SOURCE_DATASET_CELLXGENE_WITHOUT_UPDATE
    );
    expectSourceDatasetValues(
      caDraftBarAfter,
      SOURCE_DATASET_CELLXGENE_WITH_UPDATE,
      true
    );
    expectCellxGeneDatasetValues(
      caDraftBarAfter,
      CELLXGENE_DATASET_WITH_UPDATE_UPDATED
    );

    expect(caDraftBarAfter.component_info.cellCount).toEqual(
      caDraftBarBefore.component_info.cellCount -
        (SOURCE_DATASET_CELLXGENE_WITH_UPDATE.cellCount ?? 0) +
        CELLXGENE_DATASET_WITH_UPDATE_UPDATED.cell_count
    );

    expect(caDraftFooAfter).toEqual(caDraftFooBefore);
  });
});

function expectCellxGeneDatasetValues(
  componentAtlas: HCAAtlasTrackerDBComponentAtlas,
  dataset: CellxGeneDataset,
  expectToNotHave = false
): void {
  expectCellxGeneArrayValues(
    componentAtlas.component_info.assay,
    dataset.assay,
    expectToNotHave
  );
  expectCellxGeneArrayValues(
    componentAtlas.component_info.disease,
    dataset.disease,
    expectToNotHave
  );
  expectArrayValues(
    componentAtlas.component_info.suspensionType,
    dataset.suspension_type,
    expectToNotHave
  );
  expectCellxGeneArrayValues(
    componentAtlas.component_info.tissue,
    dataset.tissue,
    expectToNotHave
  );
}

function expectSourceDatasetValues(
  componentAtlas: HCAAtlasTrackerDBComponentAtlas,
  dataset: TestSourceDataset,
  expectToNotHave = false
): void {
  expectArrayValues(
    componentAtlas.component_info.assay,
    dataset.assay ?? [],
    expectToNotHave
  );
  expectArrayValues(
    componentAtlas.component_info.disease,
    dataset.disease ?? [],
    expectToNotHave
  );
  expectArrayValues(
    componentAtlas.component_info.suspensionType,
    dataset.suspensionType ?? [],
    expectToNotHave
  );
  expectArrayValues(
    componentAtlas.component_info.tissue,
    dataset.tissue ?? [],
    expectToNotHave
  );
}

function expectCellxGeneArrayValues(
  array: string[],
  values: { label: string }[],
  expectToNotHave = false
): void {
  for (const { label } of values) {
    if (expectToNotHave) expect(array).not.toContain(label);
    else expect(array).toContain(label);
  }
}

function expectArrayValues(
  array: string[],
  values: string[],
  expectToNotHave = false
): void {
  for (const value of values) {
    if (expectToNotHave) expect(array).not.toContain(value);
    else expect(array).toContain(value);
  }
}
