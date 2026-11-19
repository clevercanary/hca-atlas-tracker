import {
  CircularProgress,
  type CircularProgressProps,
} from "@databiosphere/findable-ui/lib/components/common/Progress/components/CircularProgress/circularProgress";
import {
  Link,
  type LinkProps,
} from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { type JSX, type ReactNode } from "react";
import { Cell } from "./taskCountsCell.styles";

export interface ProgressLabelProps {
  children: ReactNode;
  value: CircularProgressProps["value"];
}

export interface TaskCountsCellProps {
  label: LinkProps["label"];
  url: LinkProps["url"];
  value: CircularProgressProps["value"];
}

/**
 * Renders a progress ring followed by its label.
 * @param props - Component props.
 * @param props.children - Label.
 * @param props.value - Circular progress value.
 * @returns The ring and label.
 */
export const ProgressLabel = ({
  children,
  value,
}: ProgressLabelProps): JSX.Element => {
  return (
    <Cell>
      <CircularProgress
        color={getProgressColor(value)}
        size={16}
        thickness={6}
        value={value}
        variant="determinate"
      />
      {children}
    </Cell>
  );
};

export const TaskCountsCell = ({
  label,
  url,
  value,
}: TaskCountsCellProps): JSX.Element => {
  return (
    <ProgressLabel value={value}>
      <Link {...{ label, url }} />
    </ProgressLabel>
  );
};

/**
 * Returns circular progress color.
 * @param value - Circular progress value.
 * @returns circular progress color.
 */
function getProgressColor(value = 0): CircularProgressProps["color"] {
  if (value < 50) {
    return "warning";
  }
  return "success";
}
