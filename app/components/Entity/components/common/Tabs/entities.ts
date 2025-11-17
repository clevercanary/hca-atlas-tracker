import { Tab } from "@databiosphere/findable-ui/lib/components/common/Tabs/tabs";
import { PathParameter } from "../../../../../common/entities";
import { FormAction } from "../../../../../hooks/useFormManager/common/entities";

export interface Props {
  onNavigate?: FormAction["onNavigate"];
  pathParameter: PathParameter;
  tabs: Tab[];
}
