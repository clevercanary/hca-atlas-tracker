import { ArchivedActionKind } from "../entities";

export type UpdateArchivedAction = {
  payload: UpdateArchivedPayload;
  type: ArchivedActionKind.UpdateArchived;
};

export type UpdateArchivedPayload = boolean;
