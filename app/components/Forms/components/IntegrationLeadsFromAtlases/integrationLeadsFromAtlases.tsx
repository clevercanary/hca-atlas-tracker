import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { useCallback, useState } from "react";
import { METHOD } from "../../../../common/entities";
import { fetchResource, isFetchStatusOk } from "../../../../common/utils";
import { FormResponseErrors } from "../../../../hooks/useForm/common/entities";

export const IntegrationLeadsFromAtlasesForm = (): JSX.Element => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [responseErrors, setResponseErrors] = useState<FormResponseErrors>();
  const [didUpdate, setDidUpdate] = useState(false);

  const onSave = useCallback(() => {
    (async (): Promise<void> => {
      try {
        setIsDisabled(true);
        const res = await fetchResource(
          "/api/users/integration-leads-from-atlases",
          METHOD.PATCH,
        );
        if (isFetchStatusOk(res.status)) {
          setResponseErrors(undefined);
          setDidUpdate(true);
        } else {
          setResponseErrors(
            await res.json().catch(() => ({
              message: `Received ${res.status} ${res.statusText} response`,
            })),
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
  }, []);

  return (
    <>
      <div>
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          disabled={isDisabled}
          onClick={onSave}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Update
        </Button>
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
