import {
  Tabs as DXTabs,
  TabValue,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { ReactNode, useCallback } from "react";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../../../common/utils";
import { FormAction } from "../../../../../../hooks/useFormManager/common/entities";
import { navigateToRoute } from "../../../../../../hooks/useFormManager/common/utils";
import { ROUTE } from "../../../../../../routes/constants";

interface TabsProps {
  atlas?: HCAAtlasTrackerAtlas;
  atlasId: AtlasId;
  onNavigate?: FormAction["onNavigate"];
}

export const Tabs = ({
  atlas,
  atlasId,
  onNavigate = navigateToRoute,
}: TabsProps): JSX.Element => {
  const { route } = useRouter();
  const { sourceStudyCount } = atlas || {};

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      onNavigate(getRouteURL(tabValue, atlasId), tabValue);
    },
    [atlasId, onNavigate]
  );

  return (
    <DXTabs
      onTabChange={onChange}
      tabs={[
        { label: "Overview", value: ROUTE.ATLAS },
        {
          label: getTabLabelWithCount(
            "Source Studies",
            atlas,
            sourceStudyCount
          ),
          value: ROUTE.SOURCE_STUDIES,
        },
        {
          label: getTabLabelWithCount("Component Atlases", atlas),
          value: ROUTE.COMPONENT_ATLASES,
        },
      ]}
      value={route}
    />
  );
};

/**
 * Returns tab label with count.
 * @param label - Label.
 * @param atlas - Atlas.
 * @param count - Count.
 * @returns tab label with count.
 */
function getTabLabelWithCount(
  label: string,
  atlas?: HCAAtlasTrackerAtlas,
  count?: number
): ReactNode {
  if (!atlas) return label;
  return count ? `${label} (${count})` : label;
}
