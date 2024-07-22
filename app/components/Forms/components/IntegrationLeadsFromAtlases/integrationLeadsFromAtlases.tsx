import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { useAuthentication } from "@databiosphere/findable-ui/lib/hooks/useAuthentication/useAuthentication";
import { useCallback, useState } from "react";
import { METHOD } from "../../../../../app/common/entities";
import {
  fetchResource,
  isFetchStatusOk,
} from "../../../../../app/common/utils";
import { FormResponseErrors } from "../../../../../app/hooks/useForm/common/entities";

export const IntegrationLeadsFromAtlasesForm = (): JSX.Element => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [responseErrors, setResponseErrors] = useState<FormResponseErrors>();
  const [didUpdate, setDidUpdate] = useState(false);

  const { token } = useAuthentication();

  const onSave = useCallback(() => {
    (async (): Promise<void> => {
      try {
        setIsDisabled(true);
        const res = await fetchResource(
          "/api/users/integration-leads-from-atlases",
          METHOD.PATCH,
          token
        );
        if (isFetchStatusOk(res.status)) {
          setResponseErrors(undefined);
          setDidUpdate(true);
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
      <div>
        <ButtonPrimary disabled={isDisabled} onClick={onSave} size="small">
          Update
        </ButtonPrimary>
      </div>
      {responseErrors || didUpdate ? (
        <div style={{ marginTop: "1em" }}>
          {responseErrors
            ? buildResponseErrors(responseErrors)
            : didUpdate
            ? "Updated"
            : ""}
        </div>
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