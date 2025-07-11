export interface EntrySheetSyncState {
  started: boolean;
}

export interface UseEntrySheetSync {
  entrySheetSyncState: EntrySheetSyncState;
  onSyncEntrySheets: () => void;
}
