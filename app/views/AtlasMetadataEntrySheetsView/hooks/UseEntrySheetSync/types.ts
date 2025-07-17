export interface AtlasEntrySheetsSyncState {
  error?: unknown;
  started: boolean;
}

export interface UseAtlasEntrySheetsSync {
  entrySheetSyncState: AtlasEntrySheetsSyncState;
  onSyncEntrySheets: () => void;
}
