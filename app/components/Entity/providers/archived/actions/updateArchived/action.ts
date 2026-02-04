import { ArchivedState } from "../../entities";
import { UpdateArchivedPayload } from "./entities";

/**
 * Reducer function to handle the "update archived" action.
 * @param state - Archived State.
 * @param payload - Payload.
 * @returns archived state.
 */
export function updateArchiveAction(
  state: ArchivedState,
  payload: UpdateArchivedPayload,
): ArchivedState {
  return {
    ...state,
    archived: payload,
  };
}
