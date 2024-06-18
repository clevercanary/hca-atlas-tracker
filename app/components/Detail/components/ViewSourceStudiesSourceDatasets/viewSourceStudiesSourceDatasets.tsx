import { ButtonSecondary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonSecondary/buttonSecondary";
import { AddLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddLinkIcon/addLinkIcon";
import { Fragment, useState } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { SourceStudiesSourceDatasets } from "../TrackerForm/components/Section/components/SourceStudiesSourceDatasets/sourceStudiesSourceDatasets";
import { Dialog } from "./viewSourceStudiesSourceDatasets.styles";

export interface ViewSourceStudiesSourceDatasetsProps {
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  pathParameter: PathParameter;
  sourceStudiesSourceDatasets: HCAAtlasTrackerSourceDataset[];
}

export const ViewSourceStudiesSourceDatasets = ({
  componentAtlasSourceDatasets,
  pathParameter,
  sourceStudiesSourceDatasets,
}: ViewSourceStudiesSourceDatasetsProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const onClose = (): void => setOpen(false);
  const onOpen = (): void => setOpen(true);
  return (
    <Fragment>
      <ButtonSecondary
        disabled={sourceStudiesSourceDatasets.length === 0}
        onClick={onOpen}
        size="small"
        startIcon={<AddLinkIcon color="inkLight" fontSize="small" />}
      >
        Link source dataset
      </ButtonSecondary>
      <Dialog fullWidth onClose={onClose} open={open}>
        <SourceStudiesSourceDatasets
          componentAtlasSourceDatasets={componentAtlasSourceDatasets}
          onClose={onClose}
          pathParameter={pathParameter}
          sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
        />
      </Dialog>
    </Fragment>
  );
};
