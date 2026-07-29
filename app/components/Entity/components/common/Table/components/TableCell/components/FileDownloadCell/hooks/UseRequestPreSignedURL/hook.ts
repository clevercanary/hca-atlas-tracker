import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchData } from "@/app/hooks/useFetchData";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { useResetFetchStatus } from "@/app/hooks/useResetFetchStatus";
import { useEntity } from "app/providers/entity/hook";
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

  const { data: { filename, url } = {}, progress } = useFetchData<
    Response | undefined
  >(
    getRequestURL(API.ATLAS_FILE_PRESIGNED_URL, { atlasId, fileId }),
    METHOD.POST,
    shouldFetch,
  );

  useResetFetchStatus(progress);

  return { filename, url };
};
