import { UpdateArchivedAction } from "./updateArchived/entities";

export type ArchivedAction = UpdateArchivedAction;

export enum ArchivedActionKind {
  UpdateArchived = "UPDATE_ARCHIVED",
}
