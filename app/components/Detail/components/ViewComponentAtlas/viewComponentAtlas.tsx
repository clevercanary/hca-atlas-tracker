import { Fragment } from "react";
import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager } from "../../../../components/common/Form/components/FormManager/formManager";
import { FormMethod } from "../../../../hooks/useForm/common/entities";
import { FormManager as FormManagerProps } from "../../../../hooks/useFormManager/common/entities";
import { ViewIntegratedObjectData } from "../../../../views/ComponentAtlasView/common/entities";
import { IntegratedObjectSectionConfig } from "../../../../views/ComponentAtlasView/common/sections";
import { TrackerFormSection as Section } from "../../../Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { Divider } from "../TrackerForm/components/Divider/divider.styles";
import { TrackerForm } from "../TrackerForm/trackerForm";
import { RequestAccess } from "./components/RequestAccess/requestAccess";

interface ViewComponentAtlasProps {
  formManager: FormManagerProps;
  formMethod: FormMethod<
    ViewIntegratedObjectData,
    HCAAtlasTrackerComponentAtlas
  >;
  sectionConfigs: IntegratedObjectSectionConfig[];
}

export const ViewComponentAtlas = ({
  formManager,
  formMethod,
  sectionConfigs,
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
          <Section
            formManager={formManager}
            formMethod={formMethod}
            {...sectionConfig}
          />
        </Fragment>
      ))}
    </TrackerForm>
  );
};
