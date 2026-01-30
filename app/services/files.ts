import { VALID_FILE_TYPES_FOR_VALIDATION } from "app/apis/catalog/hca-atlas-tracker/common/constants";
import { InvalidOperationError } from "app/utils/api-handler";
import {
  FILE_VALIDATION_STATUS,
  INTEGRITY_STATUS,
  PresignedUrlInfo,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import {
  confirmFileExistsOnAtlas,
  confirmFilesExistOnAtlas,
  getAllFilesValidationParams,
  getFileKey,
  getFilesArchiveStatus,
  setFileIntegrityStatus,
  setFilesArchiveStatus,
  setFileValidationStatus,
} from "../data/files";
import { doTransaction } from "./database";
import { getDownloadUrl } from "./s3-operations";
import { submitDatasetValidationJob } from "./validator-batch";

/**
 * Get a presigned S3 URL for downloading the given file.
 * @param atlasId - ID of the atlas that the file is accessed via.
 * @param fileId - ID of file to get download URL for.
 * @returns file download URL.
 */
export async function getAtlasFileDownloadUrl(
  atlasId: string,
  fileId: string,
): Promise<PresignedUrlInfo> {
  await confirmFileExistsOnAtlas(fileId, atlasId);
  return { url: await getDownloadUrl(await getFileKey(fileId)) };
}

/**
 * Set archive status of the given files.
 * @param atlasId - ID of the atlas that the files are accessed via.
 * @param fileIds - IDs of the files to set archive status of.
 * @param isArchived - New value for whether the files are archived.
 */
export async function updateAtlasFilesArchiveStatus(
  atlasId: string,
  fileIds: string[],
  isArchived: boolean,
): Promise<void> {
  await confirmFilesExistOnAtlas(fileIds, atlasId);

  const alreadySetFileIds = (await getFilesArchiveStatus(fileIds))
    .filter((f) => f.is_archived === isArchived)
    .map(({ id }) => id);

  if (alreadySetFileIds.length)
    throw new InvalidOperationError(
      `Archived is already set to ${isArchived} for files with ID(s): ${alreadySetFileIds.join(
        ", ",
      )}`,
    );

  await setFilesArchiveStatus(fileIds, isArchived);
}

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
 * @note Any errors thrown while starting the validation (but not necessarily errors outside of that) will be caught and logged rather than being propagated.
 */
export async function startFileValidation(
  fileId: string,
  s3Key: string,
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
        client,
      );
      await setFileIntegrityStatus(fileId, INTEGRITY_STATUS.REQUESTED, client);
    });
    console.log(
      `Started Batch job ${jobId} to validate ${s3Key} (file ${fileId})`,
    );
  } catch (e) {
    console.error(
      `An error occurred while starting validation for ${s3Key} (file ${fileId}):`,
      e,
    );
    // Update validation status to note that the validation request failed
    await setFileValidationStatus(
      fileId,
      FILE_VALIDATION_STATUS.REQUEST_FAILED,
    );
  }
}
