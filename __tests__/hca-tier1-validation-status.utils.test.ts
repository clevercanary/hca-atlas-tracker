import {
  FILE_VALIDATION_STATUS,
  HCA_TIER1_VALIDATION_STATUS,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getHcaTier1ValidationStatus } from "../app/apis/catalog/hca-atlas-tracker/common/utils";

describe("getHcaTier1ValidationStatus", () => {
  it("returns UNKNOWN when validation status is pending with no existing summary", () => {
    const status = getHcaTier1ValidationStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.PENDING,
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.UNKNOWN);
  });

  it("returns UNKNOWN when validation status is job failed with no existing summary", () => {
    const status = getHcaTier1ValidationStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.JOB_FAILED,
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.UNKNOWN);
  });

  it("returns UNKNOWN when validation is completed without a summary", () => {
    const status = getHcaTier1ValidationStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: null,
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.UNKNOWN);
  });

  it("returns UNKNOWN when summary has no hcaSchema entry", () => {
    const status = getHcaTier1ValidationStatus(
      createComponentAtlas({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: {
          overallValid: true,
          validators: {},
        },
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.UNKNOWN);
  });

  it("returns INVALID when hcaSchema has `valid` set to false and nonzero errors", () => {
    const status = getHcaTier1ValidationStatus(
      createSourceDataset({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: {
          overallValid: false,
          validators: {
            hcaSchema: { errorCount: 3, valid: false, warningCount: 5 },
          },
        },
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.INVALID);
  });

  it("returns VALID when hcaSchema has `valid` set to true and zero errors, regardless of warnings", () => {
    const status = getHcaTier1ValidationStatus(
      createSourceDataset({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: {
          overallValid: true,
          validators: {
            hcaSchema: { errorCount: 0, valid: true, warningCount: 7 },
          },
        },
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.VALID);
  });

  it("returns INVALID specifically when hcaSchema has `valid` set to false, even with error count 0 (not expected in practice)", () => {
    const status = getHcaTier1ValidationStatus(
      createSourceDataset({
        validationStatus: FILE_VALIDATION_STATUS.COMPLETED,
        validationSummary: {
          overallValid: false,
          validators: {
            hcaSchema: { errorCount: 0, valid: false, warningCount: 0 },
          },
        },
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.INVALID);
  });

  // `valid` set to true with nonzero error count would be fully contradictory, so behavior in that case is unspecified.

  it("returns VALID when status is job failed but existing summary has hcaSchema with `valid` set to true", () => {
    const status = getHcaTier1ValidationStatus(
      createSourceDataset({
        validationStatus: FILE_VALIDATION_STATUS.JOB_FAILED,
        validationSummary: {
          overallValid: true,
          validators: {
            hcaSchema: { errorCount: 0, valid: true, warningCount: 0 },
          },
        },
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.VALID);
  });

  it("returns VALID when status is requested and existing summary has hcaSchema with `valid` set to true", () => {
    const status = getHcaTier1ValidationStatus(
      createSourceDataset({
        validationStatus: FILE_VALIDATION_STATUS.REQUESTED,
        validationSummary: {
          overallValid: true,
          validators: {
            hcaSchema: { errorCount: 0, valid: true, warningCount: 0 },
          },
        },
      }),
    );

    expect(status).toBe(HCA_TIER1_VALIDATION_STATUS.VALID);
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
    validationStatus: FILE_VALIDATION_STATUS.PENDING,
    validationSummary: null,
    ...overrides,
  } as HCAAtlasTrackerSourceDataset;
}
