import { DialogTitleProps } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { DialogProps } from "@mui/material";
import { FileId } from "../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props
  extends Omit<DialogProps, "onClose">,
    Omit<DialogTitleProps, "title"> {
  fileId?: FileId;
  fileName?: string;
  sizeBytes?: number;
}
