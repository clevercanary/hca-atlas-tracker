import { ValidationErrorInfo } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/entities";
import { AlertProps } from "@mui/material";

export interface Props extends AlertProps {
  metadataUrl: string;
  validationReport: ValidationErrorInfo;
}
