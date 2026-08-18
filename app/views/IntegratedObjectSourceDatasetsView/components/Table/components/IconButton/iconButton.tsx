import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useEditIntegratedObjectSourceDatasets } from "@/app/views/IntegratedObjectSourceDatasetsView/providers/editIntegratedObjectSourceDatasets/hook";
import { UnLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UnLinkIcon/unLinkIcon";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { IconButton as MIconButton } from "@mui/material";
import { type CellContext } from "@tanstack/react-table";
import { type JSX, useState } from "react";

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
      onClick={async (): Promise<void> => {
        // onDelete never rejects — a failed unlink is surfaced via the
        // app-level error snackbar and re-enables the button so it can be
        // retried; on success the row is removed by the resulting refetch.
        setIsPending(true);
        const isDeleted = await onDelete({
          sourceDatasetIds: [row.original.id],
        });
        if (!isDeleted) setIsPending(false);
      }}
      size={ICON_BUTTON_PROPS.SIZE.MEDIUM}
    >
      <UnLinkIcon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} />
    </MIconButton>
  );
};
