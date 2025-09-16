import {
  SubmitDatasetValidationJobParams,
  SubmitDatasetValidationJobResult,
} from "../validator-batch";

export const submitDatasetValidationJob = jest.fn<
  SubmitDatasetValidationJobResult,
  [SubmitDatasetValidationJobParams]
>(() => ({
  jobId: "test-job-id",
}));
