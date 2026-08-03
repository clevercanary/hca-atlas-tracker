import { type PathParameter } from "@/app/common/entities";
import { useCallback, useEffect, useState } from "react";
import { type EntrySheetSyncState, type UseEntrySheetSync } from "./types";
import { startEntrySheetSync } from "./utils";

export const useEntrySheetSync = (
  pathParameter: PathParameter,
): UseEntrySheetSync => {
  const [entrySheetSyncState, setEntrySheetSyncState] =
    useState<EntrySheetSyncState>({ started: false });

  const onSyncEntrySheets = useCallback(() => {
    setEntrySheetSyncState({ started: true });
    startEntrySheetSync(pathParameter).catch((error: unknown) => {
      setEntrySheetSyncState({ error, started: true });
    });
  }, [pathParameter]);

  useEffect(() => {
    if (entrySheetSyncState.error) throw entrySheetSyncState.error;
  }, [entrySheetSyncState]);

  return { entrySheetSyncState, onSyncEntrySheets };
};
