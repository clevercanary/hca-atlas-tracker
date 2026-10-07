import { type HCAAtlasTrackerIssuedApiToken } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";

export interface UseCreateApiToken {
  isRequesting: boolean;
  issuedToken: HCAAtlasTrackerIssuedApiToken | undefined;
  onCreate: () => Promise<boolean>;
}
