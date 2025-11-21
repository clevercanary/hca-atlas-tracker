import { MenuItem as MMenuItem } from "@mui/material";
import { forwardRef, ReactNode } from "react";
import { PUBLICATION_STATUS } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import {
  Select,
  SelectProps,
} from "../../../../../common/Form/components/Select/select";

export const PublicationStatus = forwardRef<HTMLInputElement, SelectProps>(
  function PublicationStatus(
    { className, ...props }: SelectProps,
    ref
  ): JSX.Element | null {
    return (
      <Select
        {...props}
        className={className}
        ref={ref}
        renderValue={renderValue}
        value={props.value ?? ""}
      >
        {Object.values(PUBLICATION_STATUS).map((status) => {
          return (
            <MMenuItem key={status} value={status}>
              {status}
            </MMenuItem>
          );
        })}
      </Select>
    );
  }
);

/**
 * Renders select value.
 * @param value - Value.
 * @returns select value.
 */
function renderValue(value: unknown): ReactNode {
  if (value && typeof value === "string") return value;
  return "Choose...";
}
