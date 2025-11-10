import { Fragment } from "react";
import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ViewIntegratedObjectData } from "../../../../views/ComponentAtlasView/common/entities";
import { TrackerFormSection as Section } from "../../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { SectionConfig } from "../../../Forms/common/entities";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { LinkedSourceDatasets } from "../TrackerForm/components/Section/components/ComponentAtlas/components/LinkedSourceDatasets/linkedSourceDatasets";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewComponentAtlasProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
  formMethod: FormMethod<
    ViewIntegratedObjectData,
    HCAAtlasTrackerComponentAtlas
  >;
  pathParameter: PathParameter;
  sectionConfigs: SectionConfig<
    ViewIntegratedObjectData,
    HCAAtlasTrackerComponentAtlas
  >[];
}

export const ViewComponentAtlas = ({
  atlasSourceDatasets = [],
  componentAtlasSourceDatasets = [],
  formManager,
  formMethod,
  pathParameter,
  sectionConfigs,
}: ViewComponentAtlasProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <Fragment>
      {sectionConfigs.map(({ showDivider, ...sectionConfig }, i) => (
        <Fragment key={i}>
          {(i !== 0 || showDivider) && <Divider />}
          <Section<ViewIntegratedObjectData, HCAAtlasTrackerComponentAtlas>
            formManager={formManager}
            formMethod={formMethod}
            {...sectionConfig}
          />
        </Fragment>
      ))}
      <Divider />
      <LinkedSourceDatasets
        componentAtlasSourceDatasets={componentAtlasSourceDatasets}
        formManager={formManager}
        pathParameter={pathParameter}
        atlasSourceDatasets={atlasSourceDatasets}
      />
    </Fragment>
  );
};
