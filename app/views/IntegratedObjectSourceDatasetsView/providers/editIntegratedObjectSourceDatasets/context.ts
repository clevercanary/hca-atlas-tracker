import { createContext } from "react";
import { type EditIntegratedObjectSourceDatasetsContextProps } from "./types";

export const EditIntegratedObjectSourceDatasetsContext =
  createContext<EditIntegratedObjectSourceDatasetsContextProps>({
    onDelete: () => Promise.resolve(false),
  });
