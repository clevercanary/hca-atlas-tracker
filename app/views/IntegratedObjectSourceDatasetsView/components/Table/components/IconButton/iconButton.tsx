import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { UnLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UnLinkIcon/unLinkIcon";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { IconButton as MIconButton } from "@mui/material";
import { type CellContext } from "@tanstack/react-table";
import { type JSX } from "react";
import { useUnlinkSourceDataset } from "./hooks/UseUnlinkSourceDataset/hook";

export const IconButton = ({
  row,
}: CellContext<IntegratedObjectSourceDataset, unknown>): JSX.Element => {
  const { isPending, onUnlink } = useUnlinkSourceDataset(row.original);
  return (
    <MIconButton
      aria-label="Unlink source dataset"
      color={ICON_BUTTON_PROPS.COLOR.SECONDARY}
      disabled={isPending}
      onClick={onUnlink}
      size={ICON_BUTTON_PROPS.SIZE.MEDIUM}
    >
      <UnLinkIcon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} />
    </MIconButton>
  );
};
