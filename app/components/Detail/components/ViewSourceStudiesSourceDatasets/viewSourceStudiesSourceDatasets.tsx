import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { AddLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddLinkIcon/addLinkIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Button } from "@mui/material";
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
      <Button
        {...BUTTON_PROPS.SECONDARY_CONTAINED}
        disabled={sourceStudiesSourceDatasets.length === 0}
        onClick={onOpen}
        startIcon={
          <AddLinkIcon
            color={SVG_ICON_PROPS.COLOR.INK_LIGHT}
            fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
          />
        }
      >
        Link source dataset
      </Button>
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
