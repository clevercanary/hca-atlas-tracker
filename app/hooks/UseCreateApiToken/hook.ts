import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerIssuedApiToken } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { isFetchStatusCreated } from "@/app/common/utils";
import { usePendingRequest } from "@/app/hooks/UsePendingRequest/hook";
import { useScopedRequest } from "@/app/hooks/UseScopedRequest/hook";
import { useCallback, useState } from "react";
import { type UseCreateApiToken } from "./entities";
import { parseIssuedApiToken } from "./utils";

/**
 * Returns a request function for creating an API token, and the most recently
 * created token. `onCreate` never rejects: a failure is raised on the app-level
 * error snackbar and resolves `false`.
 *
 * The token is held only in this hook's state — never in the URL, browser
 * storage or the query cache — so it is shown once: unmounting or reloading the
 * page discards it, and creating again replaces it with a new token (the
 * previous one stays valid until it expires).
 * @returns create function, the issued token, and requesting status.
 */
export const useCreateApiToken = (): UseCreateApiToken => {
  const [issuedToken, setIssuedToken] =
    useState<HCAAtlasTrackerIssuedApiToken>();
  const {
    actions: { onRequest: onScopedRequest },
  } = useScopedRequest();
  const { isRequesting, onRequest } = usePendingRequest(onScopedRequest);

  const onCreate = useCallback(async (): Promise<boolean> => {
    return onRequest(API.ACTIVE_USER_API_TOKEN, METHOD.POST, undefined, {
      // The endpoint answers 201, not 200.
      isSuccessStatus: isFetchStatusCreated,
      onSuccess: setIssuedToken,
      parseBody: parseIssuedApiToken,
    });
  }, [onRequest]);

  return { isRequesting, issuedToken, onCreate };
};
