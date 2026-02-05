import { useContext } from "react";
import { EditIntegratedObjectSourceDatasetsContext } from "./context";
import { EditIntegratedObjectSourceDatasetsContextProps } from "./types";

export const useEditIntegratedObjectSourceDatasets =
  (): EditIntegratedObjectSourceDatasetsContextProps => {
    return useContext(EditIntegratedObjectSourceDatasetsContext);
  };
