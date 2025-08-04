import { AlertProps } from "@mui/material";
import { ValidationErrorInfo } from "../../entities";

export interface Props extends AlertProps {
  metadataUrl: string;
  validationReport: ValidationErrorInfo;
}
