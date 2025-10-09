import { ArchivedActionKind } from "../entities";
import { UpdateArchiveAction } from "./entities";

/**
 * Action creator for updating archive in the state.
 * @param payload - Payload.
 * @returns Action with payload and action type.
 */
export function updateArchive(payload: boolean): UpdateArchiveAction {
  return {
    payload,
    type: ArchivedActionKind.UpdateArchive,
  };
}
