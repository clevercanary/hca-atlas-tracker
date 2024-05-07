import { PUBLICATION_STATUS } from "../../../../../../../../../../../../../views/AddNewSourceDatasetView/common/entities";
import { TabsProps } from "../../../../../../../../Tabs/tabs";

/**
 * Returns tabs for the general info section.
 * @param canEdit - User can edit the form.
 * @param isPublished - Whether the source dataset is published.
 * @param hasDoi - Whether the source dataset has a DOI.
 * @returns tabs.
 */
export function getSectionTabs(
  canEdit: boolean,
  isPublished: boolean,
  hasDoi: boolean
): TabsProps["tabs"] {
  return [
    {
      disabled: !canEdit,
      label: "Published",
      value: PUBLICATION_STATUS.PUBLISHED,
    },
    {
      disabled: !canEdit || isPublished || hasDoi, // Unpublished tab is disabled if the source dataset is published or a DOI is defined.
      label: "Unpublished",
      value: PUBLICATION_STATUS.UNPUBLISHED,
    },
  ];
}
