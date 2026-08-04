import { updateArchived } from "@/app/components/Entity/providers/archived/actions/updateArchived/dispatch";
import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { ToggleButton } from "@mui/material";
import { type JSX } from "react";
import { StyledToggleButtonGroup } from "./archiveStatusToggle.styles";
import { OPTIONS } from "./constants";
import { type Props } from "./entities";

export const ArchivedStatusToggle = (props: Props): JSX.Element | null => {
  const { archivedDispatch, archivedState } = useArchivedState();
  const { archived } = archivedState;
  return (
    <StyledToggleButtonGroup
      exclusive
      onChange={(_, v) => {
        if (v === null) return; // No change to archived state.
        archivedDispatch?.(updateArchived(JSON.parse(v)));
        // React Query consumers key their query on the archived state, so the
        // toggle refetches automatically without a dispatch.
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
