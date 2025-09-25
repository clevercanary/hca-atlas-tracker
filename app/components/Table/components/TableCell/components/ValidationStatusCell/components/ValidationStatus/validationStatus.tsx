import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { Props } from "./entities";
import { buildValidationStatus } from "./utils";

export const ValidationStatus = ({
  validationStatus,
}: Props): JSX.Element | null => {
  return <ChipCell {...buildValidationStatus(validationStatus)} />;
};
