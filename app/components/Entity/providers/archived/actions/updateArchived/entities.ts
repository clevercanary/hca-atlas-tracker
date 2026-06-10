import { ArchivedActionKind } from "../entities";

export type UpdateArchivedAction = {
  payload: UpdateArchivedPayload;
  type: ArchivedActionKind.UpdateArchived;
};

// eslint-disable-next-line sonarjs/redundant-type-aliases -- track via #1366
export type UpdateArchivedPayload = boolean;
