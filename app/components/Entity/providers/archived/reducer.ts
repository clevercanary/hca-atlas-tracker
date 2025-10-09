import { ArchivedAction, ArchivedActionKind } from "./actions/entities";
import { updateArchiveAction } from "./actions/updateArchived/action";
import { ArchivedState } from "./entities";

/**
 * Reducer for archived.
 * @param state - State.
 * @param action - Action.
 * @returns state.
 */
export function archivedReducer(
  state: ArchivedState,
  action: ArchivedAction
): ArchivedState {
  const { payload, type } = action;
  // eslint-disable-next-line sonarjs/no-small-switch -- allow small switch.
  switch (type) {
    case ArchivedActionKind.UpdateArchived: {
      return updateArchiveAction(state, payload);
    }
    default:
      return state;
  }
}
