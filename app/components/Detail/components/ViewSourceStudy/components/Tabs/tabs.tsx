import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { getRouteURL } from "@/app/common/utils";
import { getTabLabelWithCount } from "@/app/components/Detail/components/TrackerForm/components/Tabs/common/utils";
import { navigateToRoute } from "@/app/hooks/useFormManager/common/utils";
import { ROUTE } from "@/app/routes/constants";
import {
  Tabs as DXTabs,
  TabValue,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { JSX, useCallback } from "react";

interface TabsProps {
  pathParameter: PathParameter;
  sourceStudy?: HCAAtlasTrackerSourceStudy;
}

export const Tabs = ({
  pathParameter,
  sourceStudy,
}: TabsProps): JSX.Element => {
  const { route } = useRouter();

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      navigateToRoute(getRouteURL(tabValue, pathParameter));
    },
    [pathParameter],
  );

  return (
    <DXTabs
      onTabChange={onChange}
      tabs={[
        { label: "Overview", value: ROUTE.ATLAS_SOURCE_STUDY },
        {
          label: getTabLabelWithCount(
            "Datasets",
            sourceStudy?.sourceDatasetCount,
          ),
          value: ROUTE.ATLAS_SOURCE_STUDY_SOURCE_DATASETS,
        },
      ]}
      value={route}
    />
  );
};
