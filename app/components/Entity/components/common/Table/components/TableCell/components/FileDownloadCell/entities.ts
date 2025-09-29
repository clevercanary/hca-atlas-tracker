import { IconButtonProps } from "@mui/material";
import { FileId } from "../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props extends IconButtonProps {
  fileId?: FileId;
  sizeBytes?: number;
}
