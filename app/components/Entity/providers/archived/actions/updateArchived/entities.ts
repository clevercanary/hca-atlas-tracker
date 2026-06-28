import { ArchivedActionKind } from "../entities";

export type UpdateArchivedAction = {
  payload: UpdateArchivedPayload;
  type: ArchivedActionKind.UpdateArchived;
};

// eslint-disable-next-line sonarjs/redundant-type-aliases -- intentional named action-payload type; kept for the Redux action convention and as a single change-point if the payload grows beyond boolean
export type UpdateArchivedPayload = boolean;
