import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { type IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useEditIntegratedObjectSourceDatasets } from "@/app/views/IntegratedObjectSourceDatasetsView/providers/editIntegratedObjectSourceDatasets/hook";
import { UnLinkIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/UnLinkIcon/unLinkIcon";
import { ICON_BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/iconButton";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { IconButton as MIconButton } from "@mui/material";
import { type CellContext } from "@tanstack/react-table";
import { type JSX, useState } from "react";
import { getUnlinkSuccessMessage } from "./utils";

export const IconButton = ({
  row,
}: CellContext<IntegratedObjectSourceDataset, unknown>): JSX.Element => {
  const [isPending, setIsPending] = useState(false);
  const { integratedObjectTitle, onDelete } =
    useEditIntegratedObjectSourceDatasets();
  const { onOpenSuccess } = useSnackbar();
  return (
    <MIconButton
      aria-label="Unlink source dataset"
      color={ICON_BUTTON_PROPS.COLOR.SECONDARY}
      disabled={isPending}
      onClick={async (): Promise<void> => {
        // onDelete never rejects — a failed unlink is surfaced via the
        // app-level error snackbar and re-enables the button so it can be
        // retried; on success it resolves once the refetch has removed the
        // row, and the confirmation is raised then.
        setIsPending(true);
        const isDeleted = await onDelete({
          sourceDatasetIds: [row.original.id],
        });
        if (!isDeleted) {
          setIsPending(false);
          return;
        }
        onOpenSuccess(
          getUnlinkSuccessMessage(row.original.title, integratedObjectTitle),
        );
      }}
      size={ICON_BUTTON_PROPS.SIZE.MEDIUM}
    >
      <UnLinkIcon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} />
    </MIconButton>
  );
};
