import {
  Tabs as DXTabs,
  TabValue,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { JSX, useCallback } from "react";
import { getRouteURL } from "../../../../../common/utils";
import { navigateToRoute } from "../../../../../hooks/useFormManager/common/utils";
import { Props } from "./entities";

export const Tabs = ({
  onNavigate = navigateToRoute,
  pathParameter,
  tabs,
}: Props): JSX.Element => {
  const { route } = useRouter();

  const onChange = useCallback(
    (tabValue: TabValue): void => {
      onNavigate(getRouteURL(tabValue, pathParameter), tabValue);
    },
    [pathParameter, onNavigate],
  );

  return <DXTabs onTabChange={onChange} tabs={tabs} value={route} />;
};
