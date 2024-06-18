import { PAPER_PANEL_STYLE } from "@databiosphere/findable-ui/lib/components/common/Paper/paper";
import { Loading } from "@databiosphere/findable-ui/lib/components/Loading/loading";
import { Fragment } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../hooks/useForm/common/entities";
import { SourceStudiesSourceDatasetsEditData } from "../../../../../../../ViewSourceStudiesSourceDatasets/common/entities";
import { Table } from "./components/Table/table";

export interface FormContentProps {
  formMethod: FormMethod<
    SourceStudiesSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >;
  sourceStudiesSourceDatasets?: HCAAtlasTrackerSourceDataset[];
}

export const FormContent = ({
  formMethod,
  sourceStudiesSourceDatasets,
}: FormContentProps): JSX.Element => {
  return (
    <Fragment>
      <Loading
        loading={!sourceStudiesSourceDatasets}
        panelStyle={PAPER_PANEL_STYLE.NONE}
      />
      {sourceStudiesSourceDatasets && (
        <Table
          formMethod={formMethod}
          sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
        />
      )}
    </Fragment>
  );
};
