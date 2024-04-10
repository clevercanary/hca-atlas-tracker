import {
  Tabs as DXTabs,
  TabValue,
} from "@clevercanary/data-explorer-ui/lib/components/common/Tabs/tabs";
import Router, { useRouter } from "next/router";
import { ReactNode, useCallback } from "react";
import {
  AtlasId,
  HCAAtlasTrackerAtlas,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../../../common/utils";
import { ROUTE } from "../../../../../../routes/constants";

interface TabsProps {
  atlas?: HCAAtlasTrackerAtlas;
  atlasId: AtlasId;
}

export const Tabs = ({ atlas, atlasId }: TabsProps): JSX.Element => {
  const { route } = useRouter();

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      Router.push(getRouteURL(tabValue, atlasId));
    },
    [atlasId]
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
