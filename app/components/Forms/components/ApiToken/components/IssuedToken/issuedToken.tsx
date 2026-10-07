import { type HCAAtlasTrackerIssuedApiToken } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { formatISOToUTCDateTime } from "@/app/utils/date-fns";
import { ALERT_PROPS } from "@databiosphere/findable-ui/lib/components/common/Alert/constants";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Alert, Button, Stack, TextField } from "@mui/material";
import copy from "copy-to-clipboard";
import { type JSX, useCallback, useEffect, useState } from "react";

/**
 * How long the copy button says "Copied" after a copy, in milliseconds.
 */
const COPIED_DURATION = 2000;

interface Props {
  issuedToken: HCAAtlasTrackerIssuedApiToken;
}

export const IssuedToken = ({
  issuedToken: { expires, token },
}: Props): JSX.Element => {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    setCopied(copy(token));
  }, [token]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_DURATION);
    return (): void => clearTimeout(timeout);
  }, [copied]);

  const expiresDateTime = formatISOToUTCDateTime(expires);

  return (
    <Stack gap={2} useFlexGap>
      <Stack direction="row" gap={1} alignItems="flex-start" useFlexGap>
        <TextField
          fullWidth
          multiline
          slotProps={{
            htmlInput: { "aria-label": "API token", readOnly: true },
          }}
          value={token}
        />
        <Button
          color={BUTTON_PROPS.COLOR.PRIMARY}
          onClick={onCopy}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </Stack>
      <div>
        Expires{" "}
        {expiresDateTime
          ? `${expiresDateTime[0]} ${expiresDateTime[1]}`
          : expires}
      </div>
      <Alert {...ALERT_PROPS.STANDARD_WARNING}>
        Copy this token now: it won&apos;t be shown again. It can&apos;t be
        revoked on its own; revoking it means rotating{" "}
        <code>NEXTAUTH_SECRET</code>, which revokes every token and signs
        everyone out.
      </Alert>
      <p>
        Paste it into your tool&apos;s configuration, e.g. as{" "}
        <code>HCA_TRACKER_API_TOKEN</code> in a gitignored <code>.env</code>
        file, and send it as an <code>
          Authorization: Bearer &lt;token&gt;
        </code>{" "}
        header.
      </p>
    </Stack>
  );
};
