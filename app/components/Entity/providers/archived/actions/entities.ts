import { UpdateArchiveAction } from "./updateArchive/entities";

export type ArchivedAction = UpdateArchiveAction;

export enum ArchivedActionKind {
  UpdateArchive = "UPDATE_ARCHIVE",
}
