import { HCAAtlasTrackerActiveUser } from "../../apis/catalog/hca-atlas-tracker/common/entities";

export interface UseFetchActiveUser {
  /**
   * True once auth status has settled and — when the user is authenticated —
   * the active-user fetch has completed. Use to decide whether `user`
   * reflects the final state; before this is true, treat the user as loading.
   */
  isSettled: boolean;
  user?: HCAAtlasTrackerActiveUser;
}
