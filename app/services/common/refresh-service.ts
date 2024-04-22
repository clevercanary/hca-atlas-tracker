export interface RefreshInfo<T> {
  data?: T;
  refreshing?: boolean;
}

export interface RefreshServiceParams<TData, TRefreshParams> {
  getRefreshedData: (
    refreshParams: TRefreshParams,
    prevData?: TData
  ) => TData | Promise<TData>;
  getRefreshParams: (data?: TData) => TRefreshParams | Promise<TRefreshParams>;
  getStoredInfo: () => RefreshInfo<TData> | undefined;
  notReadyMessage: string;
  refreshNeeded: (
    data: TData | undefined,
    refreshParams: TRefreshParams
  ) => boolean;
  setStoredInfo: (info: RefreshInfo<TData>) => void;
}

export interface RefreshService<TData> {
  getData: () => TData;
}

export class RefreshDataNotReadyError extends Error {
  name = "RefreshDataNotReadyError";
}

/**
 * Initialize data that will be refreshed using a given set of functions under a given condition.
 * @param param0 - Object containing parameters that determine the behavior of the refresh service.
 * @param param0.getRefreshedData - Function taking refresh params and optional previous data value, which refreshes the data and returns it directly or as a promise.
 * @param param0.getRefreshParams - Function taking optional current data value, which gets any values needed to do a refresh and returns them directly or as a promise.
 * @param param0.getStoredInfo - Function that returns the cached info object containing the data (or undefined if it doesn't exist), e.g. from a global variable.
 * @param param0.notReadyMessage - Message to use for an error when an attempt to access the data is made before it's initially retrieved.
 * @param param0.refreshNeeded - Function taking optional current data value and required refresh params, which returns a boolean indicating whether a refresh is needed.
 * @param param0.setStoredInfo - Function that takes the info object containing the data and stores it as a cache, e.g. in a global variable.
 * @returns object containing `getData` function that returns the current data value and starts a refresh if needed.
 */
export function makeRefreshService<TData, TRefreshParams>({
  getRefreshedData,
  getRefreshParams,
  getStoredInfo,
  notReadyMessage,
  refreshNeeded,
  setStoredInfo,
}: RefreshServiceParams<TData, TRefreshParams>): RefreshService<TData> {
  const initStoredInfo = getStoredInfo();
  let info: RefreshInfo<TData>;
  if (initStoredInfo) {
    info = initStoredInfo;
  } else {
    setStoredInfo((info = {}));
    startRefreshIfNeeded(true);
  }

  return {
    getData(): TData {
      startRefreshIfNeeded();
      if (info.data === undefined)
        throw new RefreshDataNotReadyError(notReadyMessage);
      return info.data;
    },
  };

  async function startRefreshIfNeeded(force = false): Promise<void> {
    const refreshParams = await getRefreshParams(info.data);
    const isRefreshNeeded = refreshNeeded(info.data, refreshParams);
    if (force || (!info.refreshing && isRefreshNeeded)) {
      info.refreshing = true;
      try {
        info.data = await getRefreshedData(refreshParams, info.data);
      } finally {
        info.refreshing = false;
      }
    }
  }
}
