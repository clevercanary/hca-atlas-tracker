import { FieldValues } from "react-hook-form";
import { ControllerConfig } from "../../common/Form/components/Controllers/common/entities";

/**
 * Returns controller config with input props set to read only.
 * @param controllerConfig - Controller config.
 * @returns input controller config with read only set to true.
 */
export function makeInputControllerConfigReadOnly<T extends FieldValues>(
  controllerConfig: ControllerConfig<T>
): ControllerConfig<T> {
  return {
    ...controllerConfig,
    inputProps: { ...controllerConfig.inputProps, readOnly: true },
  };
}
