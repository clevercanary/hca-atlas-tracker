import { CellContext } from "@tanstack/react-table";
import { IntegratedObjectSourceDataset } from "../../../../entities";
import { JSX, useState } from "react";
import { IconButton as MIconButton } from "@mui/material";
import { UnLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UnLinkIcon/unLinkIcon";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { useEditIntegratedObjectSourceDatasets } from "../../../../providers/editIntegratedObjectSourceDatasets/hook";

export const IconButton = ({
  row,
}: CellContext<IntegratedObjectSourceDataset, unknown>): JSX.Element => {
  const [isPending, setIsPending] = useState(false);
  const { onDelete } = useEditIntegratedObjectSourceDatasets();
  return (
    <MIconButton
      color={ICON_BUTTON_PROPS.COLOR.SECONDARY}
      disabled={isPending}
      onClick={() => {
        // Disable button immediately to prevent double-clicks.
        // No need to reset: on success the row is removed, on error an error boundary renders.
        setIsPending(true);
        void onDelete({ sourceDatasetIds: [row.original.id] });
      }}
      size={ICON_BUTTON_PROPS.SIZE.MEDIUM}
    >
      <UnLinkIcon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} />
    </MIconButton>
  );
};
