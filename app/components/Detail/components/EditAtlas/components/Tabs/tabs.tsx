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
        { label: "Overview", value: ROUTE.EDIT_ATLAS },
        {
          label: getSourceDatasetsLabel(atlas),
          value: ROUTE.VIEW_SOURCE_DATASETS,
        },
      ]}
      value={route}
    />
  );
};

/**
 * Returns source datasets label with datasets count.
 * @param atlas - Atlas.
 * @returns source datasets label.
 */
function getSourceDatasetsLabel(atlas?: HCAAtlasTrackerAtlas): ReactNode {
  if (!atlas) return "Source Datasets";
  return atlas.sourceDatasetCount
    ? `Source Datasets (${atlas.sourceDatasetCount})`
    : "Source Datasets";
}
