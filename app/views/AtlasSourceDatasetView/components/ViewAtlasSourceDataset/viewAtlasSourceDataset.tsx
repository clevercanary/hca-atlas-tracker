import { Fragment } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormManager } from "../../../../components/common/Form/components/FormManager/formManager";
import { Divider } from "../../../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { TrackerFormSection as Section } from "../../../../components/Detail/components/TrackerForm/components/Section/components/TrackerFormSection/trackerFormSection";
import { TrackerForm } from "../../../../components/Detail/components/TrackerForm/trackerForm";
import { ViewAtlasSourceDatasetData } from "../../common/entities";
import { ViewAtlasSourceDatasetProps } from "./entities";

export const ViewAtlasSourceDataset = ({
  accessFallback,
  formManager,
  formMethod,
  sectionConfigs,
}: ViewAtlasSourceDatasetProps): JSX.Element => {
  if (accessFallback) return <Fragment>{accessFallback}</Fragment>;
  return (
    <TrackerForm>
      <FormManager {...formManager} />
      {sectionConfigs.map(({ showDivider, ...sectionConfig }, i) => (
        <Fragment key={i}>
          {(i !== 0 || showDivider) && <Divider />}
          <Section<ViewAtlasSourceDatasetData, HCAAtlasTrackerSourceDataset>
            formManager={formManager}
            formMethod={formMethod}
            {...sectionConfig}
          />
        </Fragment>
      ))}
    </TrackerForm>
  );
};
