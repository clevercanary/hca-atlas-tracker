import { endPgPool } from "../app/services/database";
import { updateSourceStudyExternalIds } from "../app/services/source-studies";
import {
  CELLXGENE_ID_PUBLISHED_WITH_CHANGING_IDS,
  CELLXGENE_ID_PUBLISHED_WITH_NEW_CELLXGENE_ID,
  CELLXGENE_ID_PUBLISHED_WITH_REMOVED_CELLXGENE_ID,
  CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_A,
  CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_B,
  HCA_ID_PUBLISHED_WITH_CHANGING_IDS,
  HCA_ID_PUBLISHED_WITH_NEW_HCA_ID,
  HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_A,
  HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_B,
  SOURCE_STUDY_PUBLISHED_WITH_CHANGING_IDS,
  SOURCE_STUDY_PUBLISHED_WITH_NEW_CELLXGENE_ID,
  SOURCE_STUDY_PUBLISHED_WITH_NEW_HCA_ID,
  SOURCE_STUDY_PUBLISHED_WITH_REMOVED_CELLXGENE_ID,
  SOURCE_STUDY_PUBLISHED_WITH_REMOVED_HCA_ID,
  SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS,
  SOURCE_STUDY_PUBLISHED_WITH_UPDATED_CELLXGENE_ID,
  SOURCE_STUDY_PUBLISHED_WITH_UPDATED_HCA_ID,
} from "../testing/constants";
import {
  getExistingSourceStudyFromDatabase,
  resetDatabase,
} from "../testing/db-utils";

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

describe("updateSourceStudyExternalIds", () => {
  it("updates ids as appropriate", async () => {
    const withUnchangingIdsBefore = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS.id
    );
    const withNewHcaIdBefore = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_NEW_HCA_ID.id
    );
    const withUpdatedHcaIdBefore = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_UPDATED_HCA_ID.id
    );
    const withRemovedHcaIdBefore = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_REMOVED_HCA_ID.id
    );
    const withNewCellxGeneIdBefore = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_NEW_CELLXGENE_ID.id
    );
    const withUpdatedCellxGeneIdBefore =
      await getExistingSourceStudyFromDatabase(
        SOURCE_STUDY_PUBLISHED_WITH_UPDATED_CELLXGENE_ID.id
      );
    const withRemovedCellxGeneIdBefore =
      await getExistingSourceStudyFromDatabase(
        SOURCE_STUDY_PUBLISHED_WITH_REMOVED_CELLXGENE_ID.id
      );
    const withChangingIdsBefore = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_CHANGING_IDS.id
    );

    await updateSourceStudyExternalIds();

    const withUnchangingIdsAfter = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_UNCHANGING_IDS.id
    );
    const withNewHcaIdAfter = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_NEW_HCA_ID.id
    );
    const withUpdatedHcaIdAfter = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_UPDATED_HCA_ID.id
    );
    const withRemovedHcaIdAfter = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_REMOVED_HCA_ID.id
    );
    const withNewCellxGeneIdAfter = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_NEW_CELLXGENE_ID.id
    );
    const withUpdatedCellxGeneIdAfter =
      await getExistingSourceStudyFromDatabase(
        SOURCE_STUDY_PUBLISHED_WITH_UPDATED_CELLXGENE_ID.id
      );
    const withRemovedCellxGeneIdAfter =
      await getExistingSourceStudyFromDatabase(
        SOURCE_STUDY_PUBLISHED_WITH_REMOVED_CELLXGENE_ID.id
      );
    const withChangingIdsAfter = await getExistingSourceStudyFromDatabase(
      SOURCE_STUDY_PUBLISHED_WITH_CHANGING_IDS.id
    );

    expect(withUnchangingIdsAfter).toEqual(withUnchangingIdsBefore);

    expect(withNewHcaIdBefore.study_info.hcaProjectId).toBeNull();
    expect(withNewHcaIdAfter.study_info.hcaProjectId).toEqual(
      HCA_ID_PUBLISHED_WITH_NEW_HCA_ID
    );
    expect(withNewHcaIdAfter.study_info.cellxgeneCollectionId).toEqual(
      withNewHcaIdBefore.study_info.cellxgeneCollectionId
    );

    expect(withUpdatedHcaIdBefore.study_info.hcaProjectId).toEqual(
      HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_A
    );
    expect(withUpdatedHcaIdAfter.study_info.hcaProjectId).toEqual(
      HCA_ID_PUBLISHED_WITH_UPDATED_HCA_ID_B
    );
    expect(withUpdatedHcaIdAfter.study_info.cellxgeneCollectionId).toEqual(
      withUpdatedHcaIdBefore.study_info.cellxgeneCollectionId
    );

    expect(withRemovedHcaIdAfter).toEqual(withRemovedHcaIdBefore);

    expect(withNewCellxGeneIdAfter.study_info.hcaProjectId).toEqual(
      withNewCellxGeneIdBefore.study_info.hcaProjectId
    );
    expect(
      withNewCellxGeneIdBefore.study_info.cellxgeneCollectionId
    ).toBeNull();
    expect(withNewCellxGeneIdAfter.study_info.cellxgeneCollectionId).toEqual(
      CELLXGENE_ID_PUBLISHED_WITH_NEW_CELLXGENE_ID
    );

    expect(withUpdatedCellxGeneIdAfter.study_info.hcaProjectId).toEqual(
      withUpdatedCellxGeneIdBefore.study_info.hcaProjectId
    );
    expect(
      withUpdatedCellxGeneIdBefore.study_info.cellxgeneCollectionId
    ).toEqual(CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_A);
    expect(
      withUpdatedCellxGeneIdAfter.study_info.cellxgeneCollectionId
    ).toEqual(CELLXGENE_ID_PUBLISHED_WITH_UPDATED_CELLXGENE_ID_B);

    expect(withRemovedCellxGeneIdAfter.study_info.hcaProjectId).toEqual(
      withRemovedCellxGeneIdBefore.study_info.hcaProjectId
    );
    expect(
      withRemovedCellxGeneIdBefore.study_info.cellxgeneCollectionId
    ).toEqual(CELLXGENE_ID_PUBLISHED_WITH_REMOVED_CELLXGENE_ID);
    expect(
      withRemovedCellxGeneIdAfter.study_info.cellxgeneCollectionId
    ).toBeNull();

    expect(withChangingIdsBefore.study_info.hcaProjectId).toBeNull();
    expect(withChangingIdsAfter.study_info.hcaProjectId).toEqual(
      HCA_ID_PUBLISHED_WITH_CHANGING_IDS
    );
    expect(withChangingIdsBefore.study_info.cellxgeneCollectionId).toBeNull();
    expect(withChangingIdsAfter.study_info.cellxgeneCollectionId).toEqual(
      CELLXGENE_ID_PUBLISHED_WITH_CHANGING_IDS
    );
  });
});
