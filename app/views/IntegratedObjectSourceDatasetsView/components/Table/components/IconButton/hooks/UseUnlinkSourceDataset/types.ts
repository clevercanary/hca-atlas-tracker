export interface UseUnlinkSourceDataset {
  isPending: boolean;
  onUnlink: () => Promise<void>;
}
