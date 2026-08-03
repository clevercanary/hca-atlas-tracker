import { type PathParameter } from "@/app/common/entities";
import { type FormAction } from "@/app/hooks/useFormManager/common/entities";
import { type Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";

export interface Props {
  onNavigate?: FormAction["onNavigate"];
  pathParameter: PathParameter;
  tabs: Tab[];
}
