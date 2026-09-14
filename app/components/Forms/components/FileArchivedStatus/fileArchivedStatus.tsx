import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type APIValue } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useEditFileArchived } from "@/app/hooks/UseEditFileArchived/hook";
import { useEntity } from "@/app/providers/entity/hook";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { Button } from "@mui/material";
import { type JSX } from "react";
import { type Props } from "./entities";

export const FileArchivedStatus = ({
  className,
  isArchived,
  options,
  payload,
}: Props): JSX.Element | null => {
  const { isRequesting, onSubmit } = useEditFileArchived();
  const { pathParameter } = useEntity();
  return (
    <Button
      {...BUTTON_PROPS.SECONDARY_CONTAINED}
      className={className}
      // Disabled until onSubmit settles: the endpoint rejects a repeated
      // archive/unarchive, so a repeat click would surface an error for an
      // action that succeeded. onSubmit awaits options.onSuccess, so whatever a
      // caller returns from it widens this window.
      //
      // What a caller should return depends on whether this button survives the
      // success. The detail views return their detail invalidation, so the
      // button stays disabled until the refetched isArchived lands rather than
      // only until the response, when a second click could still re-send the
      // action against the stale isArchived. The bulk row-selection caller
      // returns nothing: it resets the selection, which unmounts this button
      // altogether, so there is no stale state left to guard.
      //
      // Neither returns invalidations it doesn't need to wait on — that only
      // stretches the dead window to the slowest roundtrip.
      disabled={isRequesting}
      onClick={(): void => {
        onSubmit(
          getRequestURL(getEndpoint(isArchived), pathParameter),
          payload,
          options,
        );
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
