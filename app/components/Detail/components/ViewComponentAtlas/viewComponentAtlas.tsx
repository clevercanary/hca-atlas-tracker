import { Fragment } from "react";
import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormManager } from "../../../../components/common/Form/components/FormManager/formManager";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ViewIntegratedObjectData } from "../../../../views/ComponentAtlasView/common/entities";
import { IntegratedObjectSectionConfig } from "../../../../views/ComponentAtlasView/common/sections";
import { TrackerFormSection as Section } from "../../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { LinkedSourceDatasets } from "../TrackerForm/components/Section/components/ComponentAtlas/components/LinkedSourceDatasets/linkedSourceDatasets";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewComponentAtlasProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  componentAtlasIsArchived?: boolean;
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
  formMethod: FormMethod<
    ViewIntegratedObjectData,
    HCAAtlasTrackerComponentAtlas
  >;
  pathParameter: PathParameter;
  sectionConfigs: IntegratedObjectSectionConfig[];
}

export const ViewComponentAtlas = ({
  atlasSourceDatasets = [],
  componentAtlasIsArchived = false,
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
      <TrackerForm>
        <FormManager {...formManager} />
        {sectionConfigs.map(({ showDivider, ...sectionConfig }, i) => (
          <Fragment key={i}>
            {(i !== 0 || showDivider) && <Divider />}
            <Section
              formManager={formManager}
              formMethod={formMethod}
              {...sectionConfig}
            />
          </Fragment>
        ))}
      </TrackerForm>
      <Divider />
      <LinkedSourceDatasets
        componentAtlasIsArchived={componentAtlasIsArchived}
        componentAtlasSourceDatasets={componentAtlasSourceDatasets}
        formManager={formManager}
        pathParameter={pathParameter}
        atlasSourceDatasets={atlasSourceDatasets}
      />
    </Fragment>
  );
};
