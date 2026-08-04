import {
  type SubmitDatasetValidationJobParams,
  type SubmitDatasetValidationJobResult,
} from "@/app/services/validator-batch";

export const submitDatasetValidationJob = jest.fn<
  SubmitDatasetValidationJobResult,
  [SubmitDatasetValidationJobParams]
>(() => ({
  jobId: "test-job-id",
}));
