import { type Dispatch } from "react";
import { type ArchivedAction } from "./actions/entities";

export type ArchivedState = {
  archived: boolean;
};

export type ArchivedStateContextProps = {
  archivedDispatch: Dispatch<ArchivedAction> | null;
  archivedState: ArchivedState;
};
