import { FileId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { IconButtonProps } from "@mui/material";

export interface Props extends IconButtonProps {
  fileId?: FileId;
  fileName?: string;
  sizeBytes?: number;
}
