import { useEntity } from "@/app/providers/entity/hook";
import { buildSheetsUrl } from "@/app/utils/google-sheets";
import { type EntityData } from "@/app/views/AtlasMetadataEntrySheetValidationView/entities";
import { type UseEntrySheetSync } from "@/app/views/AtlasMetadataEntrySheetValidationView/hooks/UseEntrySheetSync/types";
import { OpenInNewIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/OpenInNewIcon/openInNewIcon";
import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button } from "@mui/material";
import { type JSX } from "react";
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
        {...BUTTON_PRESETS.SECONDARY_MEDIUM_OUTLINED}
        disabled={entrySheetSyncState.started}
        onClick={onSyncEntrySheets}
      >
        {entrySheetSyncState.started ? "Sync started" : "Sync entry sheet"}
      </Button>
      <Button
        {...BUTTON_PRESETS.PRIMARY_MEDIUM_CONTAINED}
        href={buildSheetsUrl(entrySheetId)}
        startIcon={<OpenInNewIcon />}
        rel={REL_ATTRIBUTE.NO_OPENER_NO_REFERRER}
        target={ANCHOR_TARGET.BLANK}
      >
        Open Sheet
      </Button>
    </HeroActions>
  );
};
