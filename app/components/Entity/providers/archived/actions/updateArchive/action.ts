import { ArchivedState } from "../../entities";
import { UpdateArchivePayload } from "./entities";

/**
 * Reducer function to handle the "update archive" action.
 * @param state - Archived State.
 * @param payload - Payload.
 * @returns archived state.
 */
export function updateArchiveAction(
  state: ArchivedState,
  payload: UpdateArchivePayload
): ArchivedState {
  return {
    ...state,
    archived: payload,
  };
}
