import { VALID_FILE_TYPES_FOR_VALIDATION } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import {
  FILE_VALIDATION_STATUS,
  INTEGRITY_STATUS,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  getAllFilesValidationParams,
  setFileIntegrityStatus,
  setFileValidationStatus,
} from "../data/files";
import { doTransaction } from "./database";
import { submitDatasetValidationJob } from "./validator-batch";

/**
 * Start validation for all files in the database.
 */
export async function validateAllFiles(): Promise<void> {
  for (const info of await getAllFilesValidationParams()) {
    const { file_type: fileType, id, key } = info;
    if (!VALID_FILE_TYPES_FOR_VALIDATION.includes(fileType)) continue;
    await startFileValidation(id, key);
  }
}

/**
 * Start a validation batch job for a given file, updating its validation status and integrity status as appropriate.
 * @param fileId - ID of the file to validate.
 * @param s3Key - S3 key of the file to validate.
 * @note Any errors thrown while starting the validation will be caught and logged rather than being propagated.
 */
export async function startFileValidation(
  fileId: string,
  s3Key: string
): Promise<void> {
  try {
    // Start job
    const { jobId } = await submitDatasetValidationJob({
      fileId,
      s3Key,
    });
    // Update validation status and integrity status to reflect the in-progress validation
    await doTransaction(async (client) => {
      await setFileValidationStatus(
        fileId,
        FILE_VALIDATION_STATUS.REQUESTED,
        client
      );
      await setFileIntegrityStatus(fileId, INTEGRITY_STATUS.REQUESTED, client);
    });
    console.log(
      `Started Batch job ${jobId} to validate ${s3Key} (file ${fileId})`
    );
  } catch (e) {
    console.error(
      `An error occurred while starting validation for ${s3Key} (file ${fileId}):`,
      e
    );
    // Update validation status to note that the validation request failed
    await setFileValidationStatus(
      fileId,
      FILE_VALIDATION_STATUS.REQUEST_FAILED
    );
  }
}
