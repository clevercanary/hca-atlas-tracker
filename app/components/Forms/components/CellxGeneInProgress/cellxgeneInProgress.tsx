import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { useCredentials } from "@databiosphere/findable-ui/lib/providers/authentication/credentials/hook";
import { TextField } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import {
  TASK_STATUS,
  TaskStatusesUpdatedByDOIResult,
} from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../common/entities";
import { fetchResource, isFetchStatusOk } from "../../../../common/utils";
import { FormResponseErrors } from "../../../../hooks/useForm/common/entities";

export const CellxGeneInProgressForm = (): JSX.Element => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [responseErrors, setResponseErrors] = useState<FormResponseErrors>();
  const [updateResult, setUpdateResult] =
    useState<TaskStatusesUpdatedByDOIResult>();

  const textareaRef = useRef<HTMLTextAreaElement>();

  const {
    credentialsState: { credentials: token },
  } = useCredentials();

  const onSave = useCallback(() => {
    (async (): Promise<void> => {
      try {
        setIsDisabled(true);
        const trimmedValue = textareaRef.current?.value.trim() ?? "";
        if (!trimmedValue) throw new Error("Must enter at least one DOI");
        const dois = trimmedValue.split(/[\r\n]+/);
        const res = await fetchResource(
          "/api/tasks/cellxgene-in-progress",
          METHOD.PATCH,
          token,
          dois
        );
        if (isFetchStatusOk(res.status)) {
          setResponseErrors(undefined);
          setUpdateResult(await res.json());
        } else {
          setResponseErrors(
            await res.json().catch(() => ({
              message: `Received ${res.status} ${res.statusText} response`,
            }))
          );
        }
      } catch (e) {
        setResponseErrors({
          message: e instanceof Error ? e.message : String(e),
        });
      } finally {
        setIsDisabled(false);
      }
    })();
  }, [token]);

  return (
    <>
      <div style={{ marginBottom: "1em" }}>
        <TextField
          disabled={isDisabled}
          multiline
          placeholder="One DOI on each line"
          inputRef={textareaRef}
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <ButtonPrimary disabled={isDisabled} onClick={onSave} size="small">
          Update
        </ButtonPrimary>
      </div>
      {responseErrors || updateResult ? (
        <>
          <h2>Result</h2>
          {responseErrors
            ? buildResponseErrors(responseErrors)
            : updateResult
            ? buildUpdateResult(updateResult)
            : ""}
        </>
      ) : (
        ""
      )}
    </>
  );
};

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

function buildUpdateResult(
  updateResult: TaskStatusesUpdatedByDOIResult
): JSX.Element {
  const notUpdatedIncompatible = Object.values(TASK_STATUS)
    .map((status) =>
      status === TASK_STATUS.IN_PROGRESS ? [] : updateResult.notUpdated[status]
    )
    .flat();
  return (
    <>
      {buildDoiList("Successfully updated", updateResult.updated)}
      {buildDoiList("Not found", updateResult.notFound)}
      {buildDoiList(
        "Not updated (already marked as in progress)",
        updateResult.notUpdated.IN_PROGRESS
      )}
      {buildDoiList(
        "Not updated (existing task status is incompatible)",
        notUpdatedIncompatible
      )}
    </>
  );
}

function buildDoiList(headingText: string, dois: string[]): JSX.Element {
  return (
    <>
      <h3>{headingText}</h3>
      {dois.length === 0 ? (
        "None"
      ) : (
        <ul>
          {dois.map((doi) => (
            <li key={doi}>{doi}</li>
          ))}
        </ul>
      )}
    </>
  );
}
