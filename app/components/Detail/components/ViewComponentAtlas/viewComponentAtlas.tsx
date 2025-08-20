import { Fragment } from "react";
import {
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ComponentAtlasEditData } from "../../../../views/ComponentAtlasView/common/entities";
import { FormManager } from "../../../common/Form/components/FormManager/formManager";
import { TrackerFormSection as Section } from "../../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { SectionConfig } from "../../../Forms/common/entities";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { LinkedSourceDatasets } from "../TrackerForm/components/Section/components/ComponentAtlas/components/LinkedSourceDatasets/linkedSourceDatasets";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewComponentAtlasProps {
  componentAtlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formManager: FormManagerProps;
  formMethod: FormMethod<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>;
  pathParameter: PathParameter;
  sectionConfigs: SectionConfig<
    ComponentAtlasEditData,
    HCAAtlasTrackerComponentAtlas
  >[];
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const ViewComponentAtlas = ({
  componentAtlasSourceDatasets = [],
  formManager,
  formMethod,
  pathParameter,
  sectionConfigs,
  sourceStudiesSourceDatasets = [],
}: ViewComponentAtlasProps): JSX.Element => {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <RequestAccess />;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      {sectionConfigs.map(({ showDivider, ...sectionConfig }, i) => (
        <Fragment key={i}>
          {(i !== 0 || showDivider) && <Divider />}
          <Section<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>
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
        sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
      />
    </TrackerForm>
  );
};
