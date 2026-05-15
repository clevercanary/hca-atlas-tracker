import { ChipCell } from "@databiosphere/findable-ui/lib/components/Table/components/TableCell/components/ChipCell/chipCell";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { ChipProps } from "@mui/material";
import { Getter } from "@tanstack/react-table";
import { ComponentProps } from "react";

export function buildValidationStatusChipCell(
  props: Pick<ChipProps, "color" | "label">,
): ComponentProps<typeof ChipCell> {
  return {
    getValue: (() => {
      return {
        ...props,
        variant: CHIP_PROPS.VARIANT.STATUS,
      };
    }) as Getter<ChipProps>,
  } as ComponentProps<typeof ChipCell>;
}
