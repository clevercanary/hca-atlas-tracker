import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import {
  ExploreViewProps as DXExploreViewProps,
  ExploreView,
} from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import { JSX } from "react";
import { useUpdateExploreState } from "./hooks/useUpdateExploreState";

export const EntitiesView = ({
  entityListType,
  ...props
}: DXExploreViewProps): JSX.Element => {
  const {
    access: { canEdit },
  } = useFormManager();
  useUpdateExploreState(canEdit);

  return <ExploreView entityListType={entityListType} {...props} />;
};
