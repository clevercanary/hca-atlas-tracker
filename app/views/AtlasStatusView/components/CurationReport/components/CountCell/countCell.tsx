import { StyledEmpty } from "@/app/views/AtlasStatusView/components/CurationReport/components/TableCard/tableCard.styles";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Link } from "@mui/material";
import { type JSX } from "react";
import { type Props } from "./types";

/**
 * A count that opens the other view filtered to its row, or a quiet dash when there is nothing to count.
 * @param props - Component props.
 * @param props.children - Count label.
 * @param props.count - Count; zero shows the empty content.
 * @param props.empty - Content shown when the count is zero.
 * @param props.onClick - Opens the filtered view.
 * @returns The count cell.
 */
export const CountCell = ({
  children,
  count,
  empty = <StyledEmpty>—</StyledEmpty>,
  onClick,
}: Props): JSX.Element => {
  return (
    <span>
      {count ? (
        <Link
          component="button"
          onClick={onClick}
          type="button"
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
        >
          {children}
        </Link>
      ) : (
        empty
      )}
    </span>
  );
};
