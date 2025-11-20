import { LinkedSourceDatasets } from "../../../../components/Detail/components/TrackerForm/components/Section/components/ComponentAtlas/components/LinkedSourceDatasets/linkedSourceDatasets";
import { useEntity } from "../../../../providers/entity/hook";
import { Entity } from "../../entities";

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
