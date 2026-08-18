import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD, type PathParameter } from "@/app/common/entities";
import { getRequestURL, getRouteURL } from "@/app/common/utils";
import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import { ROUTE } from "@/app/routes/constants";
import { SOURCE_STUDY } from "@/app/views/SourceStudyView/hooks/UseFetchSourceStudy/query/constants";
import { useQueryClient } from "@tanstack/react-query";
import Router from "next/router";
import { useCallback } from "react";

export interface UseDeleteSourceStudy {
  onDelete: () => Promise<boolean>;
}

export const useDeleteSourceStudy = (
  pathParameter: PathParameter,
): UseDeleteSourceStudy => {
  const queryClient = useQueryClient();
  const { onClose: closeSnackbar, onOpen: openSnackbar } = useSnackbar();

  // A failed delete (including a network-level error) is surfaced via the
  // app-level error snackbar (SnackbarProvider is mounted in _app); onDelete
  // resolves false rather than rejecting.
  const onError = useCallback(
    (error: Error): void => {
      openSnackbar(error.message);
    },
    [openSnackbar],
  );

  const onSuccess = useCallback((): void => {
    // Dismiss a stale error from a previous attempt before redirecting.
    closeSnackbar();
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
  }, [closeSnackbar, pathParameter, queryClient]);

  const { onDelete } = useDeleteData(
    getRequestURL(API.ATLAS_SOURCE_STUDY, pathParameter),
    METHOD.DELETE,
    { onError, onSuccess },
  );

  return {
    onDelete,
  };
};
