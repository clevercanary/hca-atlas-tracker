import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useEffect, useState } from "react";
import { METHOD } from "../../../../../app/common/entities";
import { fetchResource } from "../../../../../app/common/utils";
import { FormResponseErrors } from "../../../../../app/hooks/useForm/common/entities";
import {
  REFRESH_ACTIVITY,
  REFRESH_OUTCOME,
  RefreshServicesStatuses,
  RefreshStatus,
} from "../../../../../app/services/common/entities";

export const RefreshForm = (): JSX.Element => {
  const [statusIsDisabled, setStatusIsDisabled] = useState(false);
  const [statusResponseErrors, setStatusResponseErrors] =
    useState<FormResponseErrors>();
  const [statuses, setStatuses] = useState<RefreshServicesStatuses>();

  const [refreshIsDisabled, setRefreshIsDisabled] = useState(false);
  const [refreshResponseErrors, setRefreshResponseErrors] =
    useState<FormResponseErrors>();
  const [refreshStarted, setRefreshStarted] = useState(false);

  const { token } = useAuthentication();

  const onReloadStatus = useCallback(() => {
    doApiRequest(
      METHOD.GET,
      token,
      setStatusIsDisabled,
      setStatusResponseErrors
    ).then(async (res) => {
      if (res) setStatuses(await res.json());
    });
  }, [token]);

  const onRefresh = useCallback(() => {
    doApiRequest(
      METHOD.POST,
      token,
      setRefreshIsDisabled,
      setRefreshResponseErrors
    ).then(async (res) => {
      if (res) setRefreshStarted(true);
    });
  }, [token]);

  useEffect(onReloadStatus, [onReloadStatus]);

  return (
    <>
      {statusResponseErrors
        ? buildResponseErrors(statusResponseErrors)
        : statuses
        ? buildStatuses(statuses)
        : ""}
      <div style={{ marginBottom: "1em", marginTop: "1em" }}>
        <ButtonPrimary
          disabled={statusIsDisabled}
          onClick={onReloadStatus}
          size="small"
        >
          Reload Status
        </ButtonPrimary>
        <ButtonPrimary
          style={{ marginLeft: "1em" }}
          disabled={refreshIsDisabled}
          onClick={onRefresh}
          size="small"
        >
          Start Refresh
        </ButtonPrimary>
      </div>
      {refreshResponseErrors ? (
        buildResponseErrors(refreshResponseErrors)
      ) : refreshStarted ? (
        <div>Refresh started</div>
      ) : (
        ""
      )}
    </>
  );
};

function buildStatuses(statuses: RefreshServicesStatuses): JSX.Element {
  return (
    <>
      <div>HCA: {getStatusString(statuses.hca)}</div>
      <div>CELLxGENE: {getStatusString(statuses.cellxgene)}</div>
    </>
  );
}

function getStatusString(status: RefreshStatus): string {
  switch (status.currentActivity) {
    case REFRESH_ACTIVITY.ATTEMPTING_REFRESH:
      return (
        "Starting refresh" +
        (status.lastAttemptedAt ? " (" + status.lastAttemptedAt + ")" : "")
      );
    case REFRESH_ACTIVITY.NOT_REFRESHING:
      return (
        getStatusOutcomeString(status) +
        (status.lastResolvedAt ? " (" + status.lastResolvedAt + ")" : "")
      );
    case REFRESH_ACTIVITY.REFRESHING:
      return (
        "Refreshing" +
        (status.lastAttemptedAt ? " (" + status.lastAttemptedAt + ")" : "")
      );
  }
}

function getStatusOutcomeString(status: RefreshStatus): string {
  switch (status.previousOutcome) {
    case REFRESH_OUTCOME.COMPLETED:
      return "Completed";
    case REFRESH_OUTCOME.FAILED:
      return status.errorMessage === null
        ? "Failed"
        : `Failed with error - ${status.errorMessage}`;
    case REFRESH_OUTCOME.NA:
      return "Not started";
  }
}

function buildResponseErrors(responseErrors: FormResponseErrors): JSX.Element {
  return "message" in responseErrors ? (
    <div>Error: {responseErrors.message}</div>
  ) : (
    <>
      <div>Error:</div>
      {Object.entries(responseErrors.errors).map(([field, message]) => (
        <div key={field}>
          {field}: {message}
        </div>
      ))}
    </>
  );
}

async function doApiRequest(
  method: METHOD,
  token: string | undefined,
  setIsDisabled: (d: boolean) => void,
  setResponseErrors: (e: FormResponseErrors | undefined) => void
): Promise<Response | null> {
  try {
    setIsDisabled(true);
    const res = await fetchResource("/api/refresh", method, token);
    if (200 <= res.status && res.status < 300) {
      setResponseErrors(undefined);
      return res;
    } else {
      setResponseErrors(
        await res.json().catch(() => ({
          message: `Received ${res.status} ${res.statusText} response`,
        }))
      );
      return null;
    }
  } catch (e) {
    setResponseErrors({
      message: e instanceof Error ? e.message : String(e),
    });
    return null;
  } finally {
    setIsDisabled(false);
  }
}
