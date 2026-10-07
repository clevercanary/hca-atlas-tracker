import { ROLE } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { NoAccess } from "@/app/components/Detail/components/AddSourceStudy/components/NoAccess/noAccess";
import { useAuthorization } from "@/app/hooks/useAuthorization";
import { useCreateApiToken } from "@/app/hooks/UseCreateApiToken/hook";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { type JSX } from "react";
import { IssuedToken } from "./components/IssuedToken/issuedToken";

export const ApiTokenForm = (): JSX.Element | null => {
  const { user } = useAuthorization();
  const { isRequesting, issuedToken, onCreate } = useCreateApiToken();

  // These states only shape the page: `POST /api/me/api-token` enforces the
  // same rules itself.
  if (!user) return null;
  if (user.disabled || user.role !== ROLE.CONTENT_ADMIN) return <NoAccess />;
  if (!user.canIssueApiTokens)
    return <p>API tokens are not enabled for your account.</p>;

  return (
    <>
      <p>
        An API token lets a script or agent read from the tracker&apos;s API as
        you. It is read-only, expires 30 days after it is created, and is shown
        only once.
      </p>
      <div style={{ marginBottom: "1em" }}>
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          disabled={isRequesting}
          onClick={onCreate}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          Create token
        </Button>
      </div>
      {issuedToken && (
        // Keyed so a new token starts out with fresh "copied" state.
        <IssuedToken issuedToken={issuedToken} key={issuedToken.token} />
      )}
    </>
  );
};
