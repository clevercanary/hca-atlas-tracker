import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import { ROUTE } from "@/app/routes/constants";
import { SOURCE_STUDY } from "@/app/views/SourceStudyView/hooks/UseFetchSourceStudy/query/constants";
import { useQueryClient } from "@tanstack/react-query";
import Router from "next/router";
import { useCallback, useRef, useState } from "react";

export interface UseDeleteSourceStudy {
  isDeleting: boolean;
  onDelete: () => Promise<boolean>;
}

export const useDeleteSourceStudy = (
  pathParameter: PathParameter,
): UseDeleteSourceStudy => {
  const queryClient = useQueryClient();

  const onSuccess = useCallback((): void => {
    const { atlasId, sourceStudyId } = pathParameter;
    // Drop the deleted study's own detail query from the cache.
    // removeQueries, not invalidateQueries: invalidateQueries would refetch
    // the active detail observer (the detail page is still mounted here) and
    // 404 on the deleted study. removeQueries doesn't proactively refetch,
    // and the redirect below unmounts the detail observer immediately
    // regardless.
    queryClient.removeQueries({
      queryKey: [SOURCE_STUDY, atlasId, sourceStudyId],
    });
    // The destination list isn't invalidated: it's staleTime: 0, so its
    // mount refetch after the redirect already drops the deleted study.
    // Per app/query/README, navigation staleness is the staleTime: 0 axis;
    // invalidation is only for mutating a list that stays mounted.
    Router.push(getRouteURL(ROUTE.ATLAS_SOURCE_STUDIES, pathParameter));
  }, [pathParameter, queryClient]);

  // A failed delete is surfaced via the app-level error snackbar; onDelete
  // resolves false rather than rejecting.
  const { onDelete: deleteSourceStudy } = useDeleteData(
    getRequestURL(API.ATLAS_SOURCE_STUDY, pathParameter),
    METHOD.DELETE,
    { onSuccess },
  );

  /*
   * One delete at a time. The menu closes on click but can be reopened while
   * the request is still away, and a second identical DELETE is not merely
   * redundant: the snackbar keys an entry by method, URL and payload, so two
   * in-flight copies of this request share one. The second's success then
   * dismisses that key and erases the first's unread failure — the operation
   * being reported on did fail, and the user never sees it.
   *
   * A ref as well as state because the state update doesn't land before a
   * second click in the same tick could read it. The ref is the guard; the
   * state is what disables the menu item.
   */
  const isDeletingRef = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = useCallback(async (): Promise<boolean> => {
    if (isDeletingRef.current) return false;
    isDeletingRef.current = true;
    setIsDeleting(true);
    try {
      return await deleteSourceStudy();
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  }, [deleteSourceStudy]);

  return {
    isDeleting,
    onDelete,
  };
};
