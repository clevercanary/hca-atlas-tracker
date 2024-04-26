import {
  OnTabChangeFn,
  Tab as DXTab,
  TabsProps as DXTabsProps,
} from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { Tab as MTab } from "@mui/material";
import { Tabs as FormTabs } from "./tabs.styles";

interface Tab extends DXTab {
  disabled?: boolean;
}

export interface TabsProps extends Omit<DXTabsProps, "tabs" | "onTabChange"> {
  onTabChange?: OnTabChangeFn;
  tabs: Tab[];
}

export const Tabs = ({ onTabChange, tabs, value }: TabsProps): JSX.Element => {
  return (
    <FormTabs
      onChange={(_, tabValue): void => onTabChange?.(tabValue)}
      scrollButtons={false}
      value={value}
    >
      {tabs.map((tab, t) => (
        <MTab key={t} {...tab} />
      ))}
    </FormTabs>
  );
};
