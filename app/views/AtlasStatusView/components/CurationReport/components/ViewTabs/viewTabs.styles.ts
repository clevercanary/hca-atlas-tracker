import { TOOLBAR_CONTROL_HEIGHT } from "@/app/views/AtlasStatusView/components/CurationReport/components/ReportOverview/constants";
import { PALETTE } from "@databiosphere/findable-ui/lib/styles/common/constants/palette";
import styled from "@emotion/styled";
import { ToggleButtonGroup } from "@mui/material";

// Same look as the tracker's Active/Archived table toggle, at the toolbar's
// control height so it lines up with the filter buttons.
export const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  /* The theme lays buttons out as equal grid columns; size each to its label. */
  align-self: flex-start;
  display: inline-flex;

  .MuiToggleButton-root {
    flex: none;
    height: ${TOOLBAR_CONTROL_HEIGHT}px;
    max-height: none;
    min-width: 0;
    padding: 0 12px;
    text-transform: none;

    &:not(.Mui-selected) {
      color: ${PALETTE.INK_MAIN};
    }
  }
`;

// The count after the label, like the atlas tabs' "(0)", in a subdued colour.
export const StyledCount = styled.span`
  color: ${PALETTE.INK_LIGHT};
  margin-left: 4px;
`;
