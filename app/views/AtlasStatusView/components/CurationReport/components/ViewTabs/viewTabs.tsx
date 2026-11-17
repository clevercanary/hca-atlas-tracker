import { ToggleButton } from "@mui/material";
import { type JSX } from "react";
import { type Props } from "./types";
import { StyledCount, StyledToggleButtonGroup } from "./viewTabs.styles";

export const ViewTabs = <T extends string>({
  onChange,
  options,
  value,
}: Props<T>): JSX.Element => {
  return (
    <StyledToggleButtonGroup
      aria-label="View"
      exclusive
      onChange={(_, option): void => {
        if (option !== null) onChange(option);
      }}
      value={value}
    >
      {options.map(({ count, label, value: optionValue }) => (
        <ToggleButton key={optionValue} value={optionValue}>
          {label}
          <StyledCount>({count})</StyledCount>
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};
