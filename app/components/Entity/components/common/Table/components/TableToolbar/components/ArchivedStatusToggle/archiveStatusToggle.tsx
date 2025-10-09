import { ToggleButton, ToggleButtonGroupProps } from "@mui/material";
import { useFetchDataState } from "../../../../../../../../../hooks/useFetchDataState";
import { fetchData } from "../../../../../../../../../providers/fetchDataState/actions/fetchData/dispatch";
import { updateArchived } from "../../../../../../../providers/archived/actions/updateArchived/dispatch";
import { useArchivedState } from "../../../../../../../providers/archived/hook";
import { StyledToggleButtonGroup } from "./archiveStatusToggle.styles";
import { OPTIONS } from "./constants";

export const ArchivedStatusToggle = (
  props: ToggleButtonGroupProps
): JSX.Element | null => {
  const { fetchDataDispatch } = useFetchDataState();
  const { archivedDispatch, archivedState } = useArchivedState();
  const { archived } = archivedState;
  return (
    <StyledToggleButtonGroup
      exclusive
      onChange={(_, v) => {
        if (v === null) return; // No change to archived state.
        archivedDispatch?.(updateArchived(JSON.parse(v)));
        fetchDataDispatch(fetchData());
      }}
      value={String(archived)}
      {...props}
    >
      {Object.entries(OPTIONS).map(([key, value]) => (
        <ToggleButton key={key} value={key}>
          {value}
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};
