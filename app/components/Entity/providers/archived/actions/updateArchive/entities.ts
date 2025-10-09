import { ArchivedActionKind } from "../entities";

export type UpdateArchiveAction = {
  payload: UpdateArchivePayload;
  type: ArchivedActionKind.UpdateArchive;
};

export type UpdateArchivePayload = boolean;
