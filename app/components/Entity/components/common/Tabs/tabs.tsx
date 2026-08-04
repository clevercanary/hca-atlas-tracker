import { getRouteURL } from "@/app/common/utils";
import { navigateToRoute } from "@/app/hooks/useFormManager/common/utils";
import {
  Tabs as DXTabs,
  type TabValue,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { useRouter } from "next/router";
import { type JSX, useCallback } from "react";
import { type Props } from "./entities";

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
