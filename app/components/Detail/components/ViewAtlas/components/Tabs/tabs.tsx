import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { getRouteURL } from "@/app/common/utils";
import { getTabLabelWithCount } from "@/app/components/Detail/components/TrackerForm/components/Tabs/common/utils";
import { type FormAction } from "@/app/hooks/useFormManager/common/entities";
import { navigateToRoute } from "@/app/hooks/useFormManager/common/utils";
import { ROUTE } from "@/app/routes/constants";
import { type TabValue } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { type JSX, useCallback } from "react";
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
    [onNavigate, pathParameter],
  );

  return (
    <StyledTabs
      onTabChange={onChange}
      tabs={[
        { label: "Status", value: ROUTE.ATLAS_STATUS },
        { label: "Overview", value: ROUTE.ATLAS },
        {
          label: getTabLabelWithCount("Source Studies", sourceStudyCount),
          value: ROUTE.ATLAS_SOURCE_STUDIES,
        },
        {
          label: getTabLabelWithCount(
            "Metadata Entry Sheets",
            entrySheetValidationCount,
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
            componentAtlasCount,
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
