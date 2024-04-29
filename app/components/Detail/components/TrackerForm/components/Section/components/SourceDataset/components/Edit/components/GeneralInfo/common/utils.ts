import { PUBLICATION_STATUS } from "../../../../../../../../../../../../../views/AddNewSourceDatasetView/common/entities";
import { TabsProps } from "../../../../../../../../Tabs/tabs";

/**
 * Returns tabs for the general info section.
 * @param isPublished - Whether the source dataset is published.
 * @param hasDoi - Whether the source dataset has a DOI.
 * @returns tabs.
 */
export function getSectionTabs(
  isPublished: boolean,
  hasDoi: boolean
): TabsProps["tabs"] {
  return [
    {
      disabled: false,
      label: "Published",
      value: PUBLICATION_STATUS.PUBLISHED,
    },
    {
      disabled: isPublished || hasDoi, // Unpublished tab is disabled if the source dataset is published or is edited with a DOI.
      label: "Unpublished",
      value: PUBLICATION_STATUS.UNPUBLISHED,
    },
  ];
}
