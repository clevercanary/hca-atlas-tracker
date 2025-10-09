import { Dispatch } from "react";
import { ArchivedAction } from "./actions/entities";

export type ArchivedState = {
  archived: boolean;
};

export type ArchivedStateContextProps = {
  archivedDispatch: Dispatch<ArchivedAction> | null;
  archivedState: ArchivedState;
};
