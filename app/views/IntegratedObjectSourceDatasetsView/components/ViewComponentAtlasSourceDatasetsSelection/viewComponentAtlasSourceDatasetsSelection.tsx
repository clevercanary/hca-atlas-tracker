import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { AddLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddLinkIcon/addLinkIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Button } from "@mui/material";
import { JSX, Fragment, useState } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../common/entities";
import { ComponentAtlasSourceDatasetsSelection } from "./components/ComponentAtlasSourceDatasetsSelection/componentAtlasSourceDatasetsSelection";
import { Dialog } from "./viewComponentAtlasSourceDatasetsSelection.styles";

export interface ViewComponentAtlasSourceDatasetsSelectionProps {
  atlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  componentAtlasIsArchived: boolean;
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  pathParameter: PathParameter;
}

export const ViewComponentAtlasSourceDatasetsSelection = ({
  atlasSourceDatasets,
  componentAtlasIsArchived,
  componentAtlasSourceDatasets,
  pathParameter,
}: ViewComponentAtlasSourceDatasetsSelectionProps): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const onClose = (): void => setOpen(false);
  const onOpen = (): void => setOpen(true);
  return (
    <Fragment>
      <Button
        {...BUTTON_PROPS.SECONDARY_CONTAINED}
        disabled={componentAtlasIsArchived || atlasSourceDatasets.length === 0}
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
        <ComponentAtlasSourceDatasetsSelection
          componentAtlasSourceDatasets={componentAtlasSourceDatasets}
          onClose={onClose}
          pathParameter={pathParameter}
          atlasSourceDatasets={atlasSourceDatasets}
        />
      </Dialog>
    </Fragment>
  );
};
