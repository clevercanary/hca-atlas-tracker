import {
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
  REPROCESSED_STATUS,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CAP_INGEST_STATUS } from "../app/components/Table/components/TableCell/components/CAPIngestStatusCell/entities";
import { getCapIngestStatus } from "../app/components/Table/components/TableCell/components/CAPIngestStatusCell/utils";

describe("getCapIngestStatus", () => {
  it("returns NOT_REQUIRED for reprocessed source datasets", () => {
    const status = getCapIngestStatus(
      createSourceDataset({
        reprocessedStatus: REPROCESSED_STATUS.REPROCESSED,
      }),
    );

    expect(status).toBe(CAP_INGEST_STATUS.NOT_REQUIRED);
  });

  it("returns UPDATES_REQUIRED for unspecified reprocessed status", () => {
    const status = getCapIngestStatus(
      createSourceDataset({
        reprocessedStatus: REPROCESSED_STATUS.UNSPECIFIED,
      }),
    );

    expect(status).toBe(CAP_INGEST_STATUS.UPDATES_REQUIRED);
  });

  it("returns NEEDS_VALIDATION when validation is completed without summary", () => {
    const status = getCapIngestStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: null,
      }),
    );

    expect(status).toBe(CAP_INGEST_STATUS.NEEDS_VALIDATION);
  });

  it("returns CAP_READY when CAP validator is successful", () => {
    const status = getCapIngestStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: {
          overallValid: true,
          validators: { cap: true },
        },
      }),
    );

    expect(status).toBe(CAP_INGEST_STATUS.CAP_READY);
  });

  it("returns UPDATES_REQUIRED when validation completed with errors", () => {
    const status = getCapIngestStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: {
          overallValid: false,
          validators: {},
        },
      }),
    );

    expect(status).toBe(CAP_INGEST_STATUS.UPDATES_REQUIRED);
  });

  it("returns NEEDS_VALIDATION when validation is not completed", () => {
    const status = getCapIngestStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
      }),
    );

    expect(status).toBe(CAP_INGEST_STATUS.NEEDS_VALIDATION);
  });
});

/**
 * Create a component atlas.
 * @param overrides - Overrides.
 * @returns Component atlas.
 */
function createComponentAtlas(
  overrides: Partial<HCAAtlasTrackerComponentAtlas> = {},
): HCAAtlasTrackerComponentAtlas {
  return {
    validationStatus: FILE_VALIDATION_STATUS.PENDING,
    validationSummary: null,
    ...overrides,
  } as HCAAtlasTrackerComponentAtlas;
}

/**
 * Create a source dataset.
 * @param overrides - Overrides.
 * @returns Source dataset.
 */
function createSourceDataset(
  overrides: Partial<HCAAtlasTrackerSourceDataset> = {},
): HCAAtlasTrackerSourceDataset {
  return {
    reprocessedStatus: REPROCESSED_STATUS.ORIGINAL,
    validationStatus: FILE_VALIDATION_STATUS.PENDING,
    validationSummary: null,
    ...overrides,
  } as HCAAtlasTrackerSourceDataset;
}
