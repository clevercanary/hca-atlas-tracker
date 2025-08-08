import { useToggleButtonGroup } from "@databiosphere/findable-ui/lib/components/common/ToggleButtonGroup/hooks/UseToggleButtonGroup/hook";
import { ToggleButton } from "@mui/material";
import { Meta } from "../../hooks/useTable/entities";
import { OPTIONS } from "./constants";
import { Props } from "./entities";
import { StyledToggleButtonGroup } from "./toggleButtonGroup.styles";

export const ToggleButtonGroup = ({ table }: Props): JSX.Element | null => {
  const { onChange, value } = useToggleButtonGroup<keyof Meta>("required");
  const meta = table.options.meta || {};
  const values = Object.keys(meta).sort(sortValue);

  if (values.length === 0) return null;

  return (
    <StyledToggleButtonGroup
      exclusive
      onChange={(event, value) => {
        onChange?.(event, value);
        table.setColumnVisibility(meta[value]);
      }}
      value={value}
    >
      {values.map((value) => (
        <ToggleButton key={value} value={value}>
          {OPTIONS[value as keyof Meta]}
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};

/**
 * Sorts values in order of "required", "recommended", "organSpecific".
 * @param v0 - First value to sort.
 * @param v1 - Second value to sort.
 */
function sortValue(v0: string, v1: string): number {
  if (v0 === "required") return -1;
  if (v1 === "required") return 1;
  if (v0 === "recommended") return -1;
  if (v1 === "recommended") return 1;
  return 0;
}
