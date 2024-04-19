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
