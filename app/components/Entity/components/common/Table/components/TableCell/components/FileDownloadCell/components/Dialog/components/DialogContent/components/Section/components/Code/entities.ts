import { FETCH_PROGRESS } from "../../../../../../../../../../../../../../../../../hooks/useFetchData";

export interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO update useRequestPreSignedURL to return correct type
  data: any;
  progress: FETCH_PROGRESS;
}
