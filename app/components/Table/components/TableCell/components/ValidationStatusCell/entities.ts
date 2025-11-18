import { CellContext } from "@tanstack/react-table";
import { PathParameter } from "../../../../../../common/entities";
import { RouteValue } from "../../../../../../routes/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { AtlasIntegratedObject } from "../../../../../../views/ComponentAtlasesView/entities";

export type Props =
  | (CellContext<
      AtlasIntegratedObject,
      AtlasIntegratedObject["validationStatus"]
    > &
      TValue)
  | (CellContext<AtlasSourceDataset, AtlasSourceDataset["validationStatus"]> &
      TValue);

interface TValue extends PathParameter {
  validationRoute: RouteValue;
}
