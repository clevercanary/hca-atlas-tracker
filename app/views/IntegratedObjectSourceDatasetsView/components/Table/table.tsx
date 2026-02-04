import { JSX } from "react";
import { useEntity } from "../../../../providers/entity/hook";
import { Entity } from "../../entities";
import { LinkedSourceDatasets } from "../LinkedSourceDatasets/linkedSourceDatasets";

export const Table = (): JSX.Element => {
  const { data, formManager, pathParameter } = useEntity() as Entity;
  const {
    atlasSourceDatasets = [],
    componentAtlas,
    integratedObjectSourceDatasets = [],
  } = data;

  return (
    <LinkedSourceDatasets
      atlasSourceDatasets={atlasSourceDatasets}
      componentAtlasIsArchived={componentAtlas?.isArchived ?? false}
      componentAtlasSourceDatasets={integratedObjectSourceDatasets}
      formManager={formManager}
      pathParameter={pathParameter}
    />
  );
};
