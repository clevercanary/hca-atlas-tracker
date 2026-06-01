import { AlertProps } from "@mui/material";
import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props {
  validationReports?: FileValidationReports | null;
  validationStatus: FILE_VALIDATION_STATUS;
  validatorName?: FileValidatorName;
}

export type ReportSeverity = Extract<
  AlertProps["severity"],
  "error" | "warning"
>;

export interface ReportSummary {
  messages: string[];
  severity: ReportSeverity;
  title: string;
}
