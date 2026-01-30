import { JSX } from "react";
import { useToggleButtonGroup } from "@databiosphere/findable-ui/lib/components/common/ToggleButtonGroup/hooks/UseToggleButtonGroup/hook";
import { ToggleButton } from "@mui/material";
import { View } from "../../hooks/useTable/entities";
import { OPTIONS } from "./constants";
import { Props } from "./entities";
import { StyledToggleButtonGroup } from "./toggleButtonGroup.styles";

export const ToggleButtonGroup = ({ table }: Props): JSX.Element | null => {
  const { options } = table;
  const { meta } = options;
  const { viewVisibilityState } = meta || {};

  // Each entry in the viewVisibilityState is a view type (required, recommended, organSpecific).
  const values: View[] = [...viewVisibilityState.keys()];

  // Initialize the toggle button group with the first value.
  // We can take the first value as the default; the viewVisibilityState Map is initialized in order display preference.
  // Any views with no visible columns are removed from the Map.
  const { onChange, value } = useToggleButtonGroup<View>(values[0]);

  if (values.length === 0) return null;

  return (
    <StyledToggleButtonGroup
      exclusive
      onChange={(event, value) => {
        onChange?.(event, value);
        table.setColumnVisibility(viewVisibilityState.get(value) || {});
      }}
      value={value}
    >
      {values.map((value) => (
        <ToggleButton key={value} value={value}>
          {OPTIONS[value]}
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};
