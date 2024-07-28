export interface RefreshServicesStatuses {
  cellxgene: RefreshStatus;
  hca: RefreshStatus;
}

export interface RefreshStatus {
  currentActivity: REFRESH_ACTIVITY;
  errorMessage: string | null;
  previousOutcome: REFRESH_OUTCOME;
}

export enum REFRESH_ACTIVITY {
  ATTEMPTING_REFRESH = "ATTEMPTING_REFRESH",
  NOT_REFRESHING = "NOT_REFRESHING",
  REFRESHING = "REFRESHING",
}

export enum REFRESH_OUTCOME {
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  NA = "NA",
  SKIPPED = "SKIPPED",
}
