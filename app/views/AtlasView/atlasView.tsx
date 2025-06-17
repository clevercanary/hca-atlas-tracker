import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Button } from "@mui/material";
import { getRequestURL } from "app/common/utils";
import { Fragment, useCallback, useEffect, useState } from "react";
import { API } from "../../apis/catalog/hca-atlas-tracker/common/api";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { FETCH_STATUS, METHOD, PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { AtlasForm } from "../../components/Forms/components/Atlas/atlas";
import { VIEW_ATLAS_SECTION_CONFIGS } from "../../components/Forms/components/Atlas/common/sections";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { getBreadcrumbs } from "./common/utils";
import { useEditAtlasForm } from "./hooks/useEditAtlasForm";
import { useEditAtlasFormManager } from "./hooks/useEditAtlasFormManager";

interface AtlasViewProps {
  pathParameter: PathParameter;
}

interface EntrySheetSyncState {
  error?: unknown;
  started: boolean;
}

export const AtlasView = ({ pathParameter }: AtlasViewProps): JSX.Element => {
  const formMethod = useEditAtlasForm(pathParameter);
  const formManager = useEditAtlasFormManager(pathParameter, formMethod);
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: atlas } = formMethod;
  const [entrySheetSyncState, setEntrySheetSyncState] =
    useState<EntrySheetSyncState>({ started: false });
  const onSyncEntrySheets = useCallback(() => {
    setEntrySheetSyncState({ started: true });
    startEntrySheetSync(pathParameter).catch((error: unknown) =>
      setEntrySheetSyncState({ error, started: true })
    );
  }, [pathParameter]);
  useEffect(() => {
    if (Object.hasOwn(entrySheetSyncState, "error"))
      throw entrySheetSyncState.error;
  }, [entrySheetSyncState]);
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        actions={
          // Simple placeholder sync button -- this and related code should presumably be refactored once the actual entry sheets interface is implemented
          <div>
            <Button
              color="secondary"
              variant="contained"
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
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <AtlasForm
            accessFallback={renderAccessFallback(formManager)}
            formManager={formManager}
            formMethod={formMethod}
            sectionConfigs={VIEW_ATLAS_SECTION_CONFIGS}
          />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={
          <Tabs
            atlas={atlas}
            onNavigate={formAction?.onNavigate}
            pathParameter={pathParameter}
          />
        }
        title={atlas ? getAtlasName(atlas) : "View Atlas"}
      />
    </ConditionalComponent>
  );
};

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <AccessPrompt text="to view the atlas" />;
  return null;
}

async function startEntrySheetSync(
  pathParameter: PathParameter
): Promise<void> {
  const res = await fetch(
    getRequestURL(API.ATLAS_ENTRY_SHEETS_SYNC, pathParameter),
    { method: METHOD.POST }
  );
  if (res.status !== FETCH_STATUS.ACCEPTED) {
    const responseText = await res.text();
    let responseError: unknown;
    try {
      responseError = new Error(JSON.parse(responseText).message);
    } finally {
      if (!responseError) responseError = new Error(responseText);
    }
    throw responseError;
  }
}
