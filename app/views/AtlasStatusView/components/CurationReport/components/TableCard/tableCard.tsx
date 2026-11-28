import { type JSX } from "react";
import { StyledBand, StyledCard, StyledToolbar } from "./tableCard.styles";
import { type Props } from "./types";

export const TableCard = ({
  children,
  filterTags,
  toolbar,
}: Props): JSX.Element => {
  return (
    <StyledCard elevation={0}>
      <StyledToolbar>{toolbar}</StyledToolbar>
      {filterTags && <StyledBand>{filterTags}</StyledBand>}
      {children}
    </StyledCard>
  );
};
