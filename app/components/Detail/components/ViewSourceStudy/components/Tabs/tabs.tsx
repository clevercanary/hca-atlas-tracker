import {
  Tabs as DXTabs,
  TabValue,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { PathParameter } from "../../../../../../common/entities";
import { getRouteURL } from "../../../../../../common/utils";
import { navigateToRoute } from "../../../../../../hooks/useFormManager/common/utils";
import { ROUTE } from "../../../../../../routes/constants";
import { getTabLabelWithCount } from "../../../TrackerForm/components/Tabs/common/utils";

interface TabsProps {
  pathParameter: PathParameter;
}

export const Tabs = ({ pathParameter }: TabsProps): JSX.Element => {
  const { route } = useRouter();

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      navigateToRoute(getRouteURL(tabValue, pathParameter));
    },
    [pathParameter]
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
