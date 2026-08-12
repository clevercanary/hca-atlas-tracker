import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useEditIntegratedObjectSourceDatasets } from "@/app/views/IntegratedObjectSourceDatasetsView/providers/editIntegratedObjectSourceDatasets/hook";
import { UnLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UnLinkIcon/unLinkIcon";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { IconButton as MIconButton } from "@mui/material";
import { type CellContext } from "@tanstack/react-table";
import { type JSX, useState } from "react";
import { unlinkSourceDataset } from "./utils";

export const IconButton = ({
  row,
}: CellContext<IntegratedObjectSourceDataset, unknown>): JSX.Element => {
  const [isPending, setIsPending] = useState(false);
  const { onDelete } = useEditIntegratedObjectSourceDatasets();
  return (
    <MIconButton
      aria-label="Unlink source dataset"
      color={ICON_BUTTON_PROPS.COLOR.SECONDARY}
      disabled={isPending}
      onClick={(): void => {
        void unlinkSourceDataset(onDelete, row.original.id, setIsPending);
      }}
      size={ICON_BUTTON_PROPS.SIZE.MEDIUM}
    >
      <UnLinkIcon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} />
    </MIconButton>
  );
};
