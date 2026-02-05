import { createContext } from "react";
import { EditIntegratedObjectSourceDatasetsContextProps } from "./types";

export const EditIntegratedObjectSourceDatasetsContext =
  createContext<EditIntegratedObjectSourceDatasetsContextProps>({
    onDelete: () => Promise.resolve(),
  });
