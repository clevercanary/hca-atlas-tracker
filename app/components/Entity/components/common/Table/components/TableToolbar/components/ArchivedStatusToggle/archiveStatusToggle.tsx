import { updateArchived } from "@/app/components/Entity/providers/archived/actions/updateArchived/dispatch";
import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { fetchData } from "@/app/providers/fetchDataState/actions/fetchData/dispatch";
import { ToggleButton } from "@mui/material";
import { JSX } from "react";
import { StyledToggleButtonGroup } from "./archiveStatusToggle.styles";
import { OPTIONS } from "./constants";
import { Props } from "./entities";

export const ArchivedStatusToggle = ({
  fetchKeys,
  ...props
}: Props): JSX.Element | null => {
  const { fetchDataDispatch } = useFetchDataState();
  const { archivedDispatch, archivedState } = useArchivedState();
  const { archived } = archivedState;
  return (
    <StyledToggleButtonGroup
      exclusive
      onChange={(_, v) => {
        if (v === null) return; // No change to archived state.
        archivedDispatch?.(updateArchived(JSON.parse(v)));
        fetchDataDispatch(fetchData(fetchKeys));
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
