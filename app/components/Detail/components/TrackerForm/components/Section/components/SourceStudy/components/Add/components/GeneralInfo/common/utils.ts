import { TabsProps } from "@/app/components/Detail/components/TrackerForm/components/Tabs/tabs";
import { PUBLICATION_STATUS } from "@/app/views/AddNewSourceStudyView/common/entities";

/**
 * Returns tabs for the general info section.
 * @param hasDoi - Whether the source study has a DOI.
 * @returns tabs.
 */
export function getSectionTabs(hasDoi: boolean): TabsProps["tabs"] {
  return [
    {
      disabled: false,
      label: "Published / Preprint",
      value: PUBLICATION_STATUS.PUBLISHED_PREPRINT,
    },
    {
      disabled: hasDoi, // "No DOI" tab is disabled if the source study has a DOI.
      label: "No DOI",
      value: PUBLICATION_STATUS.NO_DOI,
    },
  ];
}
