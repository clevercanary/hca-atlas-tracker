import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { useDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/hooks/useDialog";
import { Fragment, JSX } from "react";
import {
  apiEntityIsPublished,
  getAtlasName,
} from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { EntityForm } from "../../components/Entity/components/EntityForm/entityForm";
import { VIEW_ATLAS_SECTION_CONFIGS } from "../../components/Forms/components/Atlas/common/sections";
import { AtlasStatuses } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { ATLAS } from "../../hooks/useFetchAtlas";
import { useFetchDataState } from "../../hooks/useFetchDataState";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { fetchData } from "../../providers/fetchDataState/actions/fetchData/dispatch";
import { getBreadcrumbs } from "./common/utils";
import { PublishDialog } from "./components/PublishDialog/publishDialog";
import { PublishDialogUnsavedChanges } from "./components/PublishDialogUnsavedChanges/publishDialogUnsavedChanges";
import { useEditAtlasForm } from "./hooks/useEditAtlasForm";
import { useEditAtlasFormManager } from "./hooks/useEditAtlasFormManager";
import { AtlasActionButton } from "./components/AtlasActionButton/atlasActionButton";
import { CreateRevisionButton } from "./components/CreateRevisionButton/createRevisionButton";

interface AtlasViewProps {
  pathParameter: PathParameter;
}

export const AtlasView = ({ pathParameter }: AtlasViewProps): JSX.Element => {
  const formMethod = useEditAtlasForm(pathParameter);
  const formManager = useEditAtlasFormManager(pathParameter, formMethod);
  const {
    access: { canEdit, canView },
    formAction,
    formStatus: { isDirty },
    isLoading,
  } = formManager;
  const { data: atlas } = formMethod;

  const { fetchDataDispatch } = useFetchDataState();
  const {
    onClose: closePublishDialog,
    onOpen: openPublishDialog,
    open: publishDialogOpen,
  } = useDialog();
  const isPublished = atlas ? apiEntityIsPublished(atlas) : null;
  const canPublish = canEdit && isPublished === false;
  const canCreateRevision = canEdit && isPublished === true;

  if (isLoading) return <Fragment />;

  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      {isDirty ? (
        <PublishDialogUnsavedChanges
          onClose={closePublishDialog}
          open={publishDialogOpen}
        />
      ) : (
        <PublishDialog
          atlas={atlas}
          onCancel={closePublishDialog}
          onPublished={() => {
            closePublishDialog();
            fetchDataDispatch(fetchData([ATLAS]));
          }}
          open={publishDialogOpen}
          pathParameter={pathParameter}
        />
      )}
      <DetailView
        actions={
          <>
            {canPublish && (
              <AtlasActionButton onClick={openPublishDialog}>
                Publish
              </AtlasActionButton>
            )}
            {canCreateRevision && (
              <CreateRevisionButton pathParameter={pathParameter} />
            )}
          </>
        }
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <EntityForm
            accessFallback={renderAccessFallback(formManager)}
            formManager={formManager}
            formMethod={formMethod}
            sectionConfigs={VIEW_ATLAS_SECTION_CONFIGS}
          />
        }
        status={atlas && <AtlasStatuses statuses={atlas} />}
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
