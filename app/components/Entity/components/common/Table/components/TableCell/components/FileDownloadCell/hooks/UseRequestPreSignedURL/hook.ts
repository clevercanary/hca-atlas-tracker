import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type PresignedUrlInfo } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useEntity } from "@/app/providers/entity/hook";
import { type DefaultError, type UseQueryResult } from "@tanstack/react-query";
import { type Props } from "./entities";
import { useQuery } from "./query/useQuery";

/**
 * Requests a presigned download URL for a file via React Query, gated on the
 * download dialog being open.
 * @param props - Props.
 * @param props.fileId - File ID.
 * @param props.open - Whether the download dialog is open.
 * @returns React Query result for the presigned URL info (`data` is `{ filename, url }`).
 */
export const useRequestPreSignedURL = ({
  fileId,
  open,
}: Props): UseQueryResult<PresignedUrlInfo, DefaultError> => {
  const { pathParameter } = useEntity();
  const atlasId = pathParameter?.atlasId;
  return useQuery(
    atlasId,
    fileId,
    open,
    getRequestURL(API.ATLAS_FILE_PRESIGNED_URL, { atlasId, fileId }),
  );
};
