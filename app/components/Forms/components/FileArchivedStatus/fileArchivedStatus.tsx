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
  const { onSubmit } = useEditFileArchived();
  const { pathParameter } = useEntity();
  return (
    <Button
      {...BUTTON_PROPS.SECONDARY_CONTAINED}
      className={className}
      onClick={() =>
        onSubmit(
          getRequestURL(getEndpoint(isArchived), pathParameter),
          payload,
          options,
        )
      }
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
