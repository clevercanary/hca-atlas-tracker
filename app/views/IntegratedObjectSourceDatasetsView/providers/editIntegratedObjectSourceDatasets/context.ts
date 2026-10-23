import { createContext } from "react";
import { type EditIntegratedObjectSourceDatasetsContextProps } from "./types";

export const EditIntegratedObjectSourceDatasetsContext =
  createContext<EditIntegratedObjectSourceDatasetsContextProps>({
    integratedObjectTitle: "",
    onDelete: () => Promise.resolve(false),
  });
