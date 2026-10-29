import { useLayoutHeight } from "@databiosphere/findable-ui/lib/components/Layout/hooks/UseLayoutHeight/hook";
import { Divider } from "@mui/material";
import { type JSX } from "react";
import { TABLE_TOOLBAR_HEIGHT } from "./constants";
import {
  StyledPinnedTableToolbar,
  StyledToolbar,
} from "./pinnedTableToolbar.styles";
import { type Props } from "./types";

export const PinnedTableToolbar = ({ children }: Props): JSX.Element => {
  // The toolbar's height sets where the table's column head pins below it.
  const { ref } = useLayoutHeight<HTMLDivElement>(TABLE_TOOLBAR_HEIGHT);
  return (
    <StyledPinnedTableToolbar ref={ref}>
      <StyledToolbar>{children}</StyledToolbar>
      <Divider />
    </StyledPinnedTableToolbar>
  );
};
