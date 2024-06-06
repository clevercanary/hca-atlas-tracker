import {
  CircularProgress,
  CircularProgressProps,
} from "@databiosphere/findable-ui/lib/components/common/Progress/components/CircularProgress/circularProgress";
import {
  Link,
  LinkProps,
} from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { Cell } from "./taskCountsCell.styles";

export interface TaskCountsCellProps {
  label: LinkProps["label"];
  url: LinkProps["url"];
  value: CircularProgressProps["value"];
}

export const TaskCountsCell = ({
  label,
  url,
  value,
}: TaskCountsCellProps): JSX.Element => {
  return (
    <Cell>
      <CircularProgress
        color={getProgressColor(value)}
        size={16}
        thickness={6}
        value={value}
        variant="determinate"
      />
      <Link {...{ label, url }} />
    </Cell>
  );
};

/**
 * Returns circular progress color.
 * @param value - Circular progress value.
 * @returns circular progress color.
 */
function getProgressColor(value = 0): CircularProgressProps["color"] {
  if (value < 75) {
    return "warning";
  }
  return "success";
}
