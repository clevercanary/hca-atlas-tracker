import { useEntity } from "app/providers/entity/hook";
import { API } from "../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "../../../../../../../../../../../common/entities";
import { getRequestURL } from "../../../../../../../../../../../common/utils";
import { useFetchData } from "../../../../../../../../../../../hooks/useFetchData";
import { useFetchDataState } from "../../../../../../../../../../../hooks/useFetchDataState";
import { useResetFetchStatus } from "../../../../../../../../../../../hooks/useResetFetchStatus";
import { Props, Response, UseRequestPreSignedURL } from "./entities";

export const useRequestPreSignedURL = ({
  fileId,
}: Props): UseRequestPreSignedURL => {
  const { pathParameter } = useEntity();

  // Validate atlasId - required for API request.
  if (!pathParameter?.atlasId) throw new Error("Atlas ID is required");
  // Validate fileId - required for API request.
  if (!fileId) throw new Error("File ID is required");

  const { atlasId } = pathParameter;

  const {
    fetchDataState: { shouldFetch },
  } = useFetchDataState();

  const { data: { url } = {}, progress } = useFetchData<Response | undefined>(
    getRequestURL(API.ATLAS_FILE_PRESIGNED_URL, { atlasId, fileId }),
    METHOD.POST,
    shouldFetch,
  );

  useResetFetchStatus(progress);

  return { url };
};
