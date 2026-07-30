import { HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "@/app/components/Entity/components/common/Tabs/tabs";
import { EntityForm } from "@/app/components/Entity/components/EntityForm/entityForm";
import { useBackPath } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { Payload } from "@/app/hooks/UseEditFileArchived/entities";
import { useFetchAtlas } from "@/app/hooks/UseFetchAtlas/hook";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { EntityProvider } from "@/app/providers/entity/provider";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { SOURCE_DATASET } from "@/app/views/AtlasSourceDatasetView/hooks/UseFetchAtlasSourceDataset/query/constants";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment, JSX } from "react";
import { StyledFileArchivedStatus } from "./atlasSourceDatasetView.styles";
import { VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS } from "./common/sections";
import { getBreadcrumbs, getTabs } from "./common/utils";
import { useEditAtlasSourceDatasetForm } from "./hooks/useEditAtlasSourceDatasetForm";
import { useEditAtlasSourceDatasetFormManager } from "./hooks/useEditAtlasSourceDatasetFormManager";

interface AtlasSourceDatasetViewProps {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetView = ({
  pathParameter,
}: AtlasSourceDatasetViewProps): JSX.Element => {
  const { data: atlas } = useFetchAtlas(pathParameter);
  const queryClient = useQueryClient();
  const formMethod = useEditAtlasSourceDatasetForm(pathParameter);
  const formManager = useEditAtlasSourceDatasetFormManager(
    pathParameter,
    formMethod,
  );
  const {
    access: { canEdit },
    formAction,
    isLoading,
  } = formManager;
  const { data: sourceDataset } = formMethod;
  const backPath = useBackPath(pathParameter);

  if (isLoading) return <Fragment />;

  return (
    <EntityProvider pathParameter={pathParameter}>
      <ConditionalComponent isIn={Boolean(atlas && sourceDataset)}>
        <DetailView
          actions={
            canEdit &&
            sourceDataset && (
              <StyledFileArchivedStatus
                isArchived={sourceDataset.isArchived}
                payload={mapPayload(sourceDataset)}
                options={{
                  onSuccess: () => {
                    // Archiving changes the source dataset detail (isArchived)
                    // and atlas-derived data; invalidate the React Query caches
                    // (and the list, for when the user navigates back).
                    queryClient.invalidateQueries({
                      queryKey: [
                        SOURCE_DATASET,
                        pathParameter.atlasId,
                        pathParameter.sourceDatasetId,
                      ],
                    });
                    queryClient.invalidateQueries({
                      queryKey: [ATLAS, pathParameter.atlasId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: [SOURCE_DATASETS, pathParameter.atlasId],
                    });
                  },
                }}
              />
            )
          }
          backPath={backPath}
          breadcrumbs={
            <Breadcrumbs
              breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
              onNavigate={formAction?.onNavigate}
            />
          }
          mainColumn={
            <EntityForm
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
