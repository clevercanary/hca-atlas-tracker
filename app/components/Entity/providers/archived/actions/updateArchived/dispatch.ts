import { ArchivedActionKind } from "../entities";
import { UpdateArchivedAction } from "./entities";

/**
 * Action creator for updating archived in the state.
 * @param payload - Payload.
 * @returns Action with payload and action type.
 */
export function updateArchived(payload: boolean): UpdateArchivedAction {
  return {
    payload,
    type: ArchivedActionKind.UpdateArchived,
  };
}
