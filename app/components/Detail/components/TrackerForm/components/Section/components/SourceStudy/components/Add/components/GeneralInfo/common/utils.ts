import { PUBLICATION_STATUS } from "../../../../../../../../../../../../../views/AddNewSourceStudyView/common/entities";
import { TabsProps } from "../../../../../../../../Tabs/tabs";

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
