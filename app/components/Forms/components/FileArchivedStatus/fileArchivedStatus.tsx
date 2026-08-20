import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type APIValue } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useEditFileArchived } from "@/app/hooks/UseEditFileArchived/hook";
import { useEntity } from "@/app/providers/entity/hook";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { Button } from "@mui/material";
import { type JSX, useState } from "react";
import { type Props } from "./entities";

export const FileArchivedStatus = ({
  className,
  isArchived,
  options,
  payload,
}: Props): JSX.Element | null => {
  const { onSubmit } = useEditFileArchived();
  const { pathParameter } = useEntity();
  const [isPending, setIsPending] = useState(false);
  return (
    <Button
      {...BUTTON_PROPS.SECONDARY_CONTAINED}
      className={className}
      disabled={isPending}
      onClick={async (): Promise<void> => {
        // Disabled until onSubmit settles: the endpoint rejects a repeated
        // archive/unarchive, so a repeat click would surface an error for an
        // action that succeeded. onSubmit awaits options.onSuccess, so when
        // it (as all callers do) returns the query invalidations, the button
        // stays disabled until the refetched isArchived lands — not just
        // until the response, when a second click could still re-send the
        // action against the stale isArchived. onSubmit never rejects — a
        // failure is surfaced via the app-level error snackbar — but the
        // finally guards re-enabling against an unexpected rejection anyway.
        setIsPending(true);
        try {
          await onSubmit(
            getRequestURL(getEndpoint(isArchived), pathParameter),
            payload,
            options,
          );
        } finally {
          setIsPending(false);
        }
      }}
    >
      {isArchived ? "Unarchive" : "Archive"}
    </Button>
  );
};

/**
 * Returns the API endpoint for file archiving or unarchiving.
 * @param isArchived - Archived status.
 * @returns API endpoint for file archiving or unarchiving.
 */
function getEndpoint(isArchived: boolean): APIValue {
  return isArchived ? API.ATLAS_FILE_UNARCHIVE : API.ATLAS_FILE_ARCHIVE;
}
