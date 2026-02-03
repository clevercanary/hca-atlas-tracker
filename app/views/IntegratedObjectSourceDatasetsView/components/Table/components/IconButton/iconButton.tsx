import { CellContext } from "@tanstack/react-table";
import { IntegratedObjectSourceDataset } from "../../../../entities";
import { JSX } from "react";
import { IconButton as MIconButton } from "@mui/material";
import { UnLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UnLinkIcon/unLinkIcon";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { useEditIntegratedObjectSourceDatasets } from "../../../../providers/editIntegratedObjectSourceDatasets/hook";

export const IconButton = ({
  row,
}: CellContext<IntegratedObjectSourceDataset, unknown>): JSX.Element => {
  const { onDelete } = useEditIntegratedObjectSourceDatasets();
  return (
    <MIconButton
      color={ICON_BUTTON_PROPS.COLOR.SECONDARY}
      onClick={() => onDelete({ sourceDatasetIds: [row.original.id] })}
      size={ICON_BUTTON_PROPS.SIZE.MEDIUM}
    >
      <UnLinkIcon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} />
    </MIconButton>
  );
};
