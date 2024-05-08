import { PUBLICATION_STATUS } from "../../../../../../../../../../../../../views/AddNewSourceDatasetView/common/entities";
import { TabsProps } from "../../../../../../../../Tabs/tabs";

/**
 * Returns tabs for the general info section.
 * @param isReadOnly - Form is read-only.
 * @param isPublished - Whether the source dataset is published.
 * @param hasDoi - Whether the source dataset has a DOI.
 * @returns tabs.
 */
export function getSectionTabs(
  isReadOnly: boolean,
  isPublished: boolean,
  hasDoi: boolean
): TabsProps["tabs"] {
  return [
    {
      disabled: isReadOnly,
      label: "Published",
      value: PUBLICATION_STATUS.PUBLISHED,
    },
    {
      disabled: isReadOnly || isPublished || hasDoi, // Unpublished tab is disabled if the source dataset is published or a DOI is defined.
      label: "Unpublished",
      value: PUBLICATION_STATUS.UNPUBLISHED,
    },
  ];
}
