import { PUBLICATION_STATUS } from "../../../../../../../../../../../../../views/AddNewSourceStudyView/common/entities";
import { TabsProps } from "../../../../../../../../Tabs/tabs";

/**
 * Returns tabs for the general info section.
 * @param isReadOnly - Form is read-only.
 * @param hasDoi - Whether the source study has a DOI.
 * @returns tabs.
 */
export function getSectionTabs(
  isReadOnly: boolean,
  hasDoi: boolean
): TabsProps["tabs"] {
  return [
    {
      disabled: isReadOnly,
      label: "Published / Preprint",
      value: PUBLICATION_STATUS.PUBLISHED_PREPRINT,
    },
    {
      disabled: isReadOnly || hasDoi, // "No DOI" tab is disabled if the source study DOI is defined.
      label: "No DOI",
      value: PUBLICATION_STATUS.NO_DOI,
    },
  ];
}
