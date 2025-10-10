import { FetchDataAction, FetchDataActionKind } from "../../fetchDataState";

/**
 * Action creator for resetting fetch status.
 * @param payload - Payload.
 * @returns Action with payload and action type.
 */
export function resetFetchStatus(payload?: string[]): FetchDataAction {
  return {
    payload,
    type: FetchDataActionKind.ResetFetchStatus,
  };
}
