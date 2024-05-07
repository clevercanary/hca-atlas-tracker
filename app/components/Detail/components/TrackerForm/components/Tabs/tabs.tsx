import {
  OnTabChangeFn,
  Tab as DXTab,
  TabsProps as DXTabsProps,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { Tab as MTab } from "@mui/material";
import { Tabs as SectionTabs } from "./tabs.styles";

interface Tab extends DXTab {
  disabled?: boolean;
}

export interface TabsProps extends Omit<DXTabsProps, "tabs" | "onTabChange"> {
  onTabChange?: OnTabChangeFn;
  tabs: Tab[];
}

export const Tabs = ({
  onTabChange,
  tabs,
  value,
  ...props /* Spread props to allow for Mui Tabs specific prop overrides. */
}: TabsProps): JSX.Element => {
  return (
    <SectionTabs
      onChange={(_, tabValue): void => onTabChange?.(tabValue)}
      scrollButtons={false}
      value={value}
      {...props}
    >
      {tabs.map((tab, t) => (
        <MTab key={t} {...tab} />
      ))}
    </SectionTabs>
  );
};
