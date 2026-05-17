import { JSX } from "react";
import { ValidationStatusChipCell } from "../ValidationStatusChipCell/validationStatusChipCell";
import { Props } from "./entities";
import { buildValidationStatus } from "./utils";

export const ValidationStatus = ({
  validationStatus,
}: Props): JSX.Element | null => {
  return (
    <ValidationStatusChipCell {...buildValidationStatus(validationStatus)} />
  );
};
