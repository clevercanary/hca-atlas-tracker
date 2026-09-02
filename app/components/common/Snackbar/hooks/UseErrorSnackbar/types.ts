export interface UseErrorSnackbar {
  dismissError: () => void;
  onError: (error: Error) => void;
}
