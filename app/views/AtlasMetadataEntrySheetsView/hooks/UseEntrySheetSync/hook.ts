import { useCallback, useEffect, useState } from "react";
import { PathParameter } from "../../../../common/entities";
import { AtlasEntrySheetsSyncState, UseAtlasEntrySheetsSync } from "./types";
import { startAtlasEntrySheetsSync } from "./utils";

export const useAtlasEntrySheetsSync = (
  pathParameter: PathParameter
): UseAtlasEntrySheetsSync => {
  const [entrySheetSyncState, setEntrySheetSyncState] =
    useState<AtlasEntrySheetsSyncState>({ started: false });

  const onSyncEntrySheets = useCallback(() => {
    setEntrySheetSyncState({ started: true });
    startAtlasEntrySheetsSync(pathParameter).catch((error: unknown) => {
      setEntrySheetSyncState({ error, started: true });
    });
  }, [pathParameter]);

  useEffect(() => {
    if (entrySheetSyncState.error) throw entrySheetSyncState.error;
  }, [entrySheetSyncState]);

  return { entrySheetSyncState, onSyncEntrySheets };
};
