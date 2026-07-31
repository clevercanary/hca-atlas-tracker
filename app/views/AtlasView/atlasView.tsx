import {
  apiEntityIsPublished,
  getAtlasName,
} from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "@/app/common/entities";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "@/app/components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { EntityForm } from "@/app/components/Entity/components/EntityForm/entityForm";
import { VIEW_ATLAS_SECTION_CONFIGS } from "@/app/components/Forms/components/Atlas/common/sections";
import { AtlasStatuses } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { useAtlasTabBackPath } from "@/app/hooks/useAtlasTabBackPath";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { useDialog } from "@databiosphere/findable-ui/lib/components/common/Dialog/hooks/useDialog";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment, JSX } from "react";
import { getBreadcrumbs } from "./common/utils";
import { AtlasActionButton } from "./components/AtlasActionButton/atlasActionButton";
import { CreateRevisionDialog } from "./components/CreateRevisionDialog/createRevisionDialog";
import { CreateRevisionDialogUnsavedChanges } from "./components/CreateRevisionDialogUnsavedChanges/createRevisionDialogUnsavedChanges";
import { PublishDialog } from "./components/PublishDialog/publishDialog";
import { PublishDialogUnsavedChanges } from "./components/PublishDialogUnsavedChanges/publishDialogUnsavedChanges";
import { useEditAtlasForm } from "./hooks/useEditAtlasForm";
import { useEditAtlasFormManager } from "./hooks/useEditAtlasFormManager";

interface AtlasViewProps {
  pathParameter: PathParameter;
}

export const AtlasView = ({ pathParameter }: AtlasViewProps): JSX.Element => {
  const formMethod = useEditAtlasForm(pathParameter);
  const formManager = useEditAtlasFormManager(pathParameter, formMethod);
  const {
    access: { canEdit },
    formAction,
    formStatus: { isDirty },
    isLoading,
  } = formManager;
  const { data: atlas } = formMethod;
  const {
    onClose: closePublishDialog,
    onOpen: openPublishDialog,
    open: publishDialogOpen,
  } = useDialog();
  const {
    onClose: closeRevisionDialog,
    onOpen: openRevisionDialog,
    open: revisionDialogOpen,
  } = useDialog();
  const backPath = useAtlasTabBackPath(pathParameter);
  const queryClient = useQueryClient();
  const isPublished = atlas ? apiEntityIsPublished(atlas) : null;
  const canPublish = canEdit && isPublished === false;
  const canCreateRevision =
    canEdit && isPublished === true && atlas?.isLatest === true;
  const { atlasId } = pathParameter;

  if (isLoading) return <Fragment />;

  return (
    <ConditionalComponent isIn={Boolean(atlas)}>
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
            queryClient.invalidateQueries({
              queryKey: [ATLAS, atlasId],
            });
          }}
          open={publishDialogOpen}
          pathParameter={pathParameter}
        />
      )}
      {isDirty ? (
        <CreateRevisionDialogUnsavedChanges
          onClose={closeRevisionDialog}
          open={revisionDialogOpen}
        />
      ) : (
        <CreateRevisionDialog
          atlas={atlas}
          onCancel={closeRevisionDialog}
          open={revisionDialogOpen}
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
              <AtlasActionButton onClick={openRevisionDialog}>
                Create New Version
              </AtlasActionButton>
            )}
          </>
        }
        backPath={backPath}
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <EntityForm
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
