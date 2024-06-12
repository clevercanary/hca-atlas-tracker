import {
  Tabs as DXTabs,
  TabValue,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { useCallback } from "react";
import {
  AtlasId,
  SourceStudyId,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../../../common/utils";
import { navigateToRoute } from "../../../../../../hooks/useFormManager/common/utils";
import { ROUTE } from "../../../../../../routes/constants";
import { getTabLabelWithCount } from "../../../TrackerForm/components/Tabs/common/utils";

interface TabsProps {
  atlasId: AtlasId;
  sourceStudyId: SourceStudyId;
}

export const Tabs = ({ atlasId, sourceStudyId }: TabsProps): JSX.Element => {
  const { route } = useRouter();

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      navigateToRoute(getRouteURL(tabValue, { atlasId, sourceStudyId }));
    },
    [atlasId, sourceStudyId]
  );

  return (
    <DXTabs
      onTabChange={onChange}
      tabs={[
        { label: "Overview", value: ROUTE.SOURCE_STUDY },
        {
          label: getTabLabelWithCount("Source Datasets"),
          value: ROUTE.SOURCE_DATASETS,
        },
      ]}
      value={route}
    />
  );
};
