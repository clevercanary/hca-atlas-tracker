import { JSX } from "react";
import { OpenInNewIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/OpenInNewIcon/openInNewIcon";
import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { Button } from "@mui/material";
import { useEntity } from "../../../../providers/entity/hook";
import { buildSheetsUrl } from "../../../../utils/google-sheets";
import { EntityData } from "../../entities";
import { UseEntrySheetSync } from "../../hooks/UseEntrySheetSync/types";
import { HeroActions } from "./actions.styles";

type Props = UseEntrySheetSync;

export const Actions = ({
  entrySheetSyncState,
  onSyncEntrySheets,
}: Props): JSX.Element | null => {
  const { data } = useEntity();

  // Coerce the entity data provided by EntityProvider to the EntityData type -- safe to assume that the data structure conforms to EntityData.
  const entityData = data as EntityData;

  const { entrySheetValidation } = entityData;
  const { entrySheetId } = entrySheetValidation || {};

  if (!entrySheetId) return null;

  return (
    <HeroActions>
      <Button
        color={BUTTON_PROPS.COLOR.SECONDARY}
        disabled={entrySheetSyncState.started}
        onClick={onSyncEntrySheets}
        size={BUTTON_PROPS.SIZE.MEDIUM}
        variant={BUTTON_PROPS.VARIANT.CONTAINED}
      >
        {entrySheetSyncState.started ? "Sync started" : "Sync entry sheet"}
      </Button>
      <Button
        color={BUTTON_PROPS.COLOR.PRIMARY}
        href={buildSheetsUrl(entrySheetId)}
        startIcon={<OpenInNewIcon />}
        rel={REL_ATTRIBUTE.NO_OPENER_NO_REFERRER}
        size={BUTTON_PROPS.SIZE.MEDIUM}
        target={ANCHOR_TARGET.BLANK}
        variant={BUTTON_PROPS.VARIANT.CONTAINED}
      >
        Open Sheet
      </Button>
    </HeroActions>
  );
};
