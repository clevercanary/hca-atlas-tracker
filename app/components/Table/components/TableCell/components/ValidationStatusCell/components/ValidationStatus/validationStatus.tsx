import { ValidationStatusChipCell } from "@/app/components/Table/components/TableCell/components/ValidationStatusCell/components/ValidationStatusChipCell/validationStatusChipCell";
import { type JSX } from "react";
import { type Props } from "./entities";
import { buildValidationStatus } from "./utils";

export const ValidationStatus = ({
  validationErrorMessage,
  validationStatus,
}: Props): JSX.Element | null => {
  return (
    <ValidationStatusChipCell
      errorMessage={validationErrorMessage}
      {...buildValidationStatus(validationStatus)}
    />
  );
};
