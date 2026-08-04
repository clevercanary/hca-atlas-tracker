import { type FileId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type DialogTitleProps } from "@databiosphere/findable-ui/lib/components/common/Dialog/components/DialogTitle/dialogTitle";
import { type DialogProps } from "@mui/material";

export interface Props
  extends Omit<DialogProps, "onClose">, Omit<DialogTitleProps, "title"> {
  fileId?: FileId;
  fileName?: string;
  sizeBytes?: number;
}
