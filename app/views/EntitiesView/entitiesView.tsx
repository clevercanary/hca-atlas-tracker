import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { ExploreView } from "@databiosphere/findable-ui/lib/views/ExploreView/exploreView";
import { type ExploreViewProps as DXExploreViewProps } from "@databiosphere/findable-ui/lib/views/ExploreView/types";
import { type JSX } from "react";
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
