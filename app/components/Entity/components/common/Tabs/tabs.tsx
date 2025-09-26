import {
  Tabs as DXTabs,
  TabValue,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { getRouteURL } from "../../../../../common/utils";
import { navigateToRoute } from "../../../../../hooks/useFormManager/common/utils";
import { Props } from "./entities";

export const Tabs = ({ pathParameter, tabs }: Props): JSX.Element => {
  const { route } = useRouter();

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      navigateToRoute(getRouteURL(tabValue, pathParameter));
    },
    [pathParameter]
  );

  return <DXTabs onTabChange={onChange} tabs={tabs} value={route} />;
};
