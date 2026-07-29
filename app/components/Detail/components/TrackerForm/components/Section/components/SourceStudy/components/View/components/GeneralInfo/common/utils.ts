import { TabsProps } from "@/app/components/Detail/components/TrackerForm/components/Tabs/tabs";
import { PUBLICATION_STATUS } from "@/app/views/AddNewSourceStudyView/common/entities";

/**
 * Returns tabs for the general info section.
 * @param isReadOnly - Form is read-only.
 * @param hasDoi - Whether the source study has a DOI.
 * @returns tabs.
 */
export function getSectionTabs(
  isReadOnly: boolean,
  hasDoi: boolean,
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
