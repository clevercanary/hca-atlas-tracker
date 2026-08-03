import {
  type FILE_VALIDATION_STATUS,
  type FileValidationReports,
  type FileValidatorName,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type AlertProps } from "@mui/material";

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
