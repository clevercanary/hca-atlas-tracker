import { TabValue } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { HCAAtlasTrackerAtlas } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../common/entities";
import { getRouteURL } from "../../../../../../common/utils";
import { FormAction } from "../../../../../../hooks/useFormManager/common/entities";
import { navigateToRoute } from "../../../../../../hooks/useFormManager/common/utils";
import { ROUTE } from "../../../../../../routes/constants";
import { getTabLabelWithCount } from "../../../TrackerForm/components/Tabs/common/utils";
import { StyledTabs } from "./tabs.styles";

interface TabsProps {
  atlas?: HCAAtlasTrackerAtlas;
  onNavigate?: FormAction["onNavigate"];
  pathParameter: PathParameter;
}

export const Tabs = ({
  atlas,
  onNavigate = navigateToRoute,
  pathParameter,
}: TabsProps): JSX.Element => {
  const { route } = useRouter();
  const {
    componentAtlasCount,
    entrySheetValidationCount,
    sourceDatasetCount,
    sourceStudyCount,
  } = atlas || {};

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      onNavigate(getRouteURL(tabValue, pathParameter), tabValue);
    },
    [onNavigate, pathParameter]
  );

  return (
    <StyledTabs
      onTabChange={onChange}
      tabs={[
        { label: "Overview", value: ROUTE.ATLAS },
        {
          label: getTabLabelWithCount("Source Studies", sourceStudyCount),
          value: ROUTE.SOURCE_STUDIES,
        },
        {
          label: getTabLabelWithCount(
            "Metadata Entry Sheets",
            entrySheetValidationCount
          ),
          value: ROUTE.METADATA_ENTRY_SHEETS,
        },
        {
          label: getTabLabelWithCount("Source Datasets", sourceDatasetCount),
          value: ROUTE.ATLAS_SOURCE_DATASETS,
        },
        {
          label: getTabLabelWithCount(
            "Integrated Objects",
            componentAtlasCount
          ),
          value: ROUTE.COMPONENT_ATLASES,
        },
        {
          label: "Metadata Correctness",
          value: ROUTE.METADATA_CORRECTNESS,
        },
      ]}
      value={route}
    />
  );
};
