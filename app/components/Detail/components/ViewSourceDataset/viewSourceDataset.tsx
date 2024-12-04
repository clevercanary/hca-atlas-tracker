import { Fragment, useState } from "react";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../../common/entities";
import { getRequestURL } from "../../../../common/utils";
import { GENERAL_INFO_VIEW_SOURCE_DATASET_CONTROLLERS } from "../TrackerForm/components/Section/components/SourceDataset/common/constants";
import { GeneralInfo } from "../TrackerForm/components/Section/components/SourceDataset/components/GeneralInfo/generalInfo";
import { FIELD_NAME } from "./common/constants";
import { SourceDatasetEditData } from "./common/entities";
import { sourceDatasetEditSchema } from "./common/schema";
import { ButtonTextPrimary, Dialog } from "./viewSourceDataset.styles";

const SCHEMA = sourceDatasetEditSchema;

interface ViewSourceDatasetProps {
  canEdit: boolean;
  pathParameter: PathParameter;
  sourceDataset: HCAAtlasTrackerSourceDataset;
}

export const ViewSourceDataset = ({
  canEdit,
  pathParameter,
  sourceDataset,
}: ViewSourceDatasetProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const onClose = (): void => setOpen(false);
  const onOpen = (): void => setOpen(true);
  const {
    cellxgeneDatasetId,
    id: sourceDatasetId,
    sourceStudyId,
    title,
  } = sourceDataset;
  return (
    <Fragment>
      <ButtonTextPrimary
        disabled={!canEdit || Boolean(cellxgeneDatasetId)}
        onClick={onOpen}
      >
        {title}
      </ButtonTextPrimary>
      <Dialog open={open} onClose={onClose}>
        <GeneralInfo<SourceDatasetEditData>
          apiData={sourceDataset}
          canDelete={true}
          controllerConfigs={GENERAL_INFO_VIEW_SOURCE_DATASET_CONTROLLERS}
          mapSchemaValues={mapSchemaValues}
          method={METHOD.PATCH}
          onClose={onClose}
          requestUrl={getRequestURL(API.ATLAS_SOURCE_DATASET, {
            ...pathParameter,
            sourceDatasetId,
            sourceStudyId,
          })}
          schema={SCHEMA}
          title="Edit dataset"
        />
      </Dialog>
    </Fragment>
  );
};

/**
 * Returns schema default values mapped from source dataset.
 * @param sourceDataset - Source dataset.
 * @returns schema default values.
 */
function mapSchemaValues(
  sourceDataset?: HCAAtlasTrackerSourceDataset
): SourceDatasetEditData {
  return { [FIELD_NAME.TITLE]: sourceDataset?.title ?? "" };
}
