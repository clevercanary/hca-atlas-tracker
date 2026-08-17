export interface UseDeleteData<T> {
  onDelete: (payload?: T) => Promise<boolean>;
}

export interface UseDeleteDataOptions {
  onError: (error: Error) => void;
  onSuccess?: () => void;
}
