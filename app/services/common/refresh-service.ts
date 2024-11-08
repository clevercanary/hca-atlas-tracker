import { REFRESH_ACTIVITY, REFRESH_OUTCOME, RefreshStatus } from "./entities";

export interface RefreshInfo<TData, TRefreshParams = undefined> {
  attemptingRefresh?: boolean;
  data?: TData;
  errorMessage?: string;
  lastAttemptedAt?: Date;
  lastResolvedAt?: Date;
  prevRefreshOutcome?: REFRESH_OUTCOME;
  prevRefreshParams?: TRefreshParams;
  refreshing?: boolean;
}

export interface RefreshServiceParams<TData, TRefreshParams> {
  getRefreshedData: (
    refreshParams: TRefreshParams,
    prevData?: TData
  ) => TData | Promise<TData>;
  getRefreshParams: (
    data?: TData,
    prevRefreshParams?: TRefreshParams
  ) => TRefreshParams | Promise<TRefreshParams>;
  getStoredInfo: () => RefreshInfo<TData, TRefreshParams> | undefined;
  notReadyMessage: string;
  onRefreshSuccess?: () => void;
  refreshNeeded: (
    data: TData | undefined,
    refreshParams: TRefreshParams
  ) => boolean;
  setStoredInfo: (info: RefreshInfo<TData, TRefreshParams>) => void;
}

export interface RefreshService<TData> {
  forceRefresh: () => void;
  getData: () => TData;
  getStatus: () => RefreshStatus;
  isRefreshing: () => boolean;
}

export class RefreshDataNotReadyError extends Error {
  name = "RefreshDataNotReadyError";
}

/**
 * Initialize data that will be refreshed using a given set of functions under a given condition.
 * @param params - Object containing parameters that determine the behavior of the refresh service.
 * @param params.getRefreshedData - Function taking refresh params and optional previous data value, which refreshes the data and returns it directly or as a promise.
 * @param params.getRefreshParams - Function taking optional current data value, which gets any values needed to do a refresh and returns them directly or as a promise.
 * @param params.getStoredInfo - Function that returns the cached info object containing the data (or undefined if it doesn't exist), e.g. from a global variable.
 * @param params.notReadyMessage - Message to use for an error when an attempt to access the data is made before it's initially retrieved.
 * @param params.onRefreshSuccess - Function to call when a refresh successfully completes.
 * @param params.refreshNeeded - Function taking optional current data value and required refresh params, which returns a boolean indicating whether a refresh is needed.
 * @param params.setStoredInfo - Function that takes the info object containing the data and stores it as a cache, e.g. in a global variable.
 * @returns object containing `getData` function that returns the current data value and starts a refresh if needed.
 */
export function makeRefreshService<TData, TRefreshParams>(
  params: RefreshServiceParams<TData, TRefreshParams>
): RefreshService<TData> {
  const { getStoredInfo, notReadyMessage, setStoredInfo } = params;
  const initStoredInfo = getStoredInfo();
  let info: RefreshInfo<TData, TRefreshParams>;
  if (initStoredInfo) {
    info = initStoredInfo;
  } else {
    setStoredInfo((info = {}));
    startRefreshIfNeeded(params, info, true);
  }

  return {
    forceRefresh(): void {
      startRefreshIfNeeded(params, info, true);
    },
    getData(): TData {
      startRefreshIfNeeded(params, info);
      if (info.data === undefined)
        throw new RefreshDataNotReadyError(notReadyMessage);
      return info.data;
    },
    getStatus(): RefreshStatus {
      return {
        currentActivity: info.refreshing
          ? REFRESH_ACTIVITY.REFRESHING
          : info.attemptingRefresh
          ? REFRESH_ACTIVITY.ATTEMPTING_REFRESH
          : REFRESH_ACTIVITY.NOT_REFRESHING,
        errorMessage: info.errorMessage ?? null,
        lastAttemptedAt: info.lastAttemptedAt?.toISOString() ?? null,
        lastResolvedAt: info.lastResolvedAt?.toISOString() ?? null,
        previousOutcome: info.prevRefreshOutcome ?? REFRESH_OUTCOME.NA,
      };
    },
    isRefreshing(): boolean {
      return Boolean(info.refreshing);
    },
  };
}

async function startRefreshIfNeeded<TData, TRefreshParams>(
  params: RefreshServiceParams<TData, TRefreshParams>,
  info: RefreshInfo<TData, TRefreshParams>,
  force = false
): Promise<void> {
  const {
    getRefreshedData,
    getRefreshParams,
    onRefreshSuccess,
    refreshNeeded,
  } = params;

  if (info.attemptingRefresh) return;
  info.attemptingRefresh = true;
  info.lastAttemptedAt = new Date();

  let refreshParams, isRefreshNeeded;
  try {
    refreshParams = await getRefreshParams(info.data, info.prevRefreshParams);
    info.prevRefreshParams = refreshParams;
    isRefreshNeeded = refreshNeeded(info.data, refreshParams);
  } catch (e) {
    info.errorMessage = getErrorMessage(e);
    info.prevRefreshOutcome = REFRESH_OUTCOME.FAILED;
    info.lastResolvedAt = new Date();
    info.attemptingRefresh = false;
    throw e;
  }

  if (force || (!info.refreshing && isRefreshNeeded)) {
    info.refreshing = true;
    let completedSuccessfully = false;
    try {
      info.data = await getRefreshedData(refreshParams, info.data);
      info.prevRefreshOutcome = REFRESH_OUTCOME.COMPLETED;
      completedSuccessfully = true;
    } catch (e) {
      info.prevRefreshOutcome = REFRESH_OUTCOME.FAILED;
      info.errorMessage = getErrorMessage(e);
    } finally {
      info.lastResolvedAt = new Date();
      info.refreshing = false;
      info.attemptingRefresh = false;
      if (completedSuccessfully) onRefreshSuccess?.();
    }
  } else {
    info.attemptingRefresh = false;
  }
}

function getErrorMessage(error: unknown): string {
  try {
    return String(
      error instanceof Error && "message" in error ? error.message : error
    );
  } catch (e) {
    return "Unknown error";
  }
}
