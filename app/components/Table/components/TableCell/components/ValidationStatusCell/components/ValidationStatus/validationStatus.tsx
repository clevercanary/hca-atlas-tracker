import { JSX } from "react";
import { ValidationStatusChipCell } from "../ValidationStatusChipCell/validationStatusChipCell";
import { Props } from "./entities";
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
