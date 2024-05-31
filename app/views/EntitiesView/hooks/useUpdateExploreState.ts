import { useExploreState } from "@databiosphere/findable-ui/lib/hooks/useExploreState";
import { ExploreActionKind } from "@databiosphere/findable-ui/lib/providers/exploreState";
import { useEffect } from "react";

export const useUpdateExploreState = (canEdit: boolean): void => {
  const { exploreDispatch } = useExploreState();
  useEffect(() => {
    exploreDispatch({
      payload: { canEdit },
      type: ExploreActionKind.UpdateEntityViewAccess,
    });
  }, [canEdit, exploreDispatch]);
};
