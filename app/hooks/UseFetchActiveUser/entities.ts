import { HCAAtlasTrackerActiveUser } from "../../apis/catalog/hca-atlas-tracker/common/entities";

export interface UseFetchActiveUser {
  /**
   * True once both auth status has settled AND (if authenticated) the user
   * fetch has completed. Use to decide whether `user` reflects the final
   * state — before this is true, treat the user as loading.
   */
  isSettled: boolean;
  user?: HCAAtlasTrackerActiveUser;
}
