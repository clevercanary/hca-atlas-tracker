import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { Payload } from "../../hooks/UseEditFileArchived/entities";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFetchDataState } from "../../hooks/useFetchDataState";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { EntityProvider } from "../../providers/entity/provider";
import { fetchData } from "../../providers/fetchDataState/actions/fetchData/dispatch";
import { StyledFileArchivedStatus } from "./atlasSourceDatasetView.styles";
import { VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS } from "./common/sections";
import { getBreadcrumbs, getTabs } from "./common/utils";
import { ViewAtlasSourceDataset } from "./components/ViewAtlasSourceDataset/viewAtlasSourceDataset";
import { useEditAtlasSourceDatasetForm } from "./hooks/useEditAtlasSourceDatasetForm";
import { useEditAtlasSourceDatasetFormManager } from "./hooks/useEditAtlasSourceDatasetFormManager";

interface AtlasSourceDatasetViewProps {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetView = ({
  pathParameter,
}: AtlasSourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { fetchDataDispatch } = useFetchDataState();
  const formMethod = useEditAtlasSourceDatasetForm(pathParameter);
  const formManager = useEditAtlasSourceDatasetFormManager(
    pathParameter,
    formMethod
  );
  const {
    access: { canEdit, canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: sourceDataset } = formMethod;
  if (isLoading) return <Fragment />;
  const accessFallback = renderAccessFallback(formManager);
  return (
    <EntityProvider pathParameter={pathParameter}>
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(atlas && sourceDataset))}
      >
        <DetailView
          actions={
            canEdit &&
            sourceDataset && (
              <StyledFileArchivedStatus
                isArchived={sourceDataset.isArchived}
                payload={mapPayload(sourceDataset)}
                options={{
                  onSuccess: () => fetchDataDispatch(fetchData()),
                }}
              />
            )
          }
          breadcrumbs={
            <Breadcrumbs
              breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
              onNavigate={formAction?.onNavigate}
            />
          }
          mainColumn={
            <ViewAtlasSourceDataset
              accessFallback={accessFallback}
              formManager={formManager}
              formMethod={formMethod}
              sectionConfigs={VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS}
            />
          }
          tabs={
            <Tabs
              onNavigate={formAction?.onNavigate}
              pathParameter={pathParameter}
              tabs={getTabs()}
            />
          }
          subTitle={sourceDataset?.publicationString}
          title={sourceDataset?.title || "Source Dataset"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};

/**
 * Returns the payload for file archiving or unarchiving.
 * @param sourceDataset - Source dataset.
 * @returns Payload for file archiving or unarchiving.
 */
function mapPayload(sourceDataset: HCAAtlasTrackerSourceDataset): Payload {
  return { fileIds: [sourceDataset.fileId] };
}

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <AccessPrompt text="to view the source dataset" />;
  return null;
}
