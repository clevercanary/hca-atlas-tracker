import { ReactNode } from "react";

/**
 * Returns tab label with count.
 * @param label - Label.
 * @param count - Count.
 * @returns tab label with count.
 */
export function getTabLabelWithCount(label: string, count?: number): ReactNode {
  if (count == null) return label;
  return `${label} (${count})`;
}
