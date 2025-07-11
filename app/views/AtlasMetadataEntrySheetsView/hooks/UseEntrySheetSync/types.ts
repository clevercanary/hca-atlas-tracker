export interface EntrySheetSyncState {
  error?: unknown;
  started: boolean;
}

export interface UseEntrySheetSync {
  entrySheetSyncState: EntrySheetSyncState;
  onSyncEntrySheets: () => void;
}
