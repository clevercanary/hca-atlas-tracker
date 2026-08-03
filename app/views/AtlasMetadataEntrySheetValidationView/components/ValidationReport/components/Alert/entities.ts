import { type ValidationErrorInfo } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/entities";
import { type AlertProps } from "@mui/material";

export interface Props extends AlertProps {
  metadataUrl: string;
  validationReport: ValidationErrorInfo;
}
