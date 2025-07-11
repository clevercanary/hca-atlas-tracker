import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Button } from "@mui/material";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { AccessDeniedPrompt } from "../../components/common/Form/components/FormManager/components/AccessDeniedPrompt/accessDeniedPrompt";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { VIEW_METADATA_ENTRY_SHEETS_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs } from "./common/utils";
import { useEntrySheetSync } from "./hooks/UseEntrySheetSync/hook";
import { useFetchEntrySheetsValidations } from "./hooks/useFetchEntrySheetValidations";

interface AtlasMetadataEntrySheetsViewProps {
  pathParameter: PathParameter;
}

export const AtlasMetadataEntrySheetsView = ({
  pathParameter,
}: AtlasMetadataEntrySheetsViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { entrySheets } = useFetchEntrySheetsValidations(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
  } = formManager;
  const { entrySheetSyncState, onSyncEntrySheets } =
    useEntrySheetSync(pathParameter);
  return (
    <EntityProvider
      data={{ atlas, entrySheets }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
        <DetailView
          actions={
            <div>
              <Button
                {...BUTTON_PROPS.SECONDARY_CONTAINED}
                disabled={entrySheetSyncState.started}
                onClick={onSyncEntrySheets}
              >
                {entrySheetSyncState.started
                  ? "Sync started"
                  : "Sync entry sheets"}
              </Button>
            </div>
          }
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              accessFallback={renderAccessFallback(formManager)}
              sectionConfigs={VIEW_METADATA_ENTRY_SHEETS_SECTION_CONFIGS}
            />
          }
          status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
          tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
          title={atlas ? getAtlasName(atlas) : "View Metadata Entry Sheets"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <AccessPrompt text="to view metadata entry sheets" />;
  if (!canEdit) return <AccessDeniedPrompt />;
  return null;
}
