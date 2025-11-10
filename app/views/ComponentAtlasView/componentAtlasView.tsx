import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { HCAAtlasTrackerComponentAtlas } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ViewComponentAtlas } from "../../components/Detail/components/ViewComponentAtlas/viewComponentAtlas";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { Payload } from "../../hooks/UseEditFileArchived/entities";
import { useFetchDataState } from "../../hooks/useFetchDataState";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { fetchData } from "../../providers/fetchDataState/actions/fetchData/dispatch";
import { VIEW_INTEGRATED_OBJECT_SECTION_CONFIGS } from "./common/sections";
import { getBreadcrumbs, getTabs } from "./common/utils";
import { StyledFileArchivedStatus } from "./componentAtlasView.styles";
import { INTEGRATED_OBJECT } from "./hooks/useFetchComponentAtlas";
import { useFetchComponentAtlasData } from "./hooks/useFetchComponentAtlasData";
import { useViewComponentAtlasForm } from "./hooks/useViewComponentAtlasForm";

interface ComponentAtlasViewProps {
  pathParameter: PathParameter;
}

export const ComponentAtlasView = ({
  pathParameter,
}: ComponentAtlasViewProps): JSX.Element => {
  const componentAtlasData = useFetchComponentAtlasData(pathParameter);
  const { fetchDataDispatch } = useFetchDataState();
  const formMethod = useViewComponentAtlasForm(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canEdit, canView },
    isLoading,
  } = formManager;
  const { data: componentAtlas } = formMethod;
  const { atlas, atlasSourceDatasets, componentAtlasSourceDatasets } =
    componentAtlasData;
  if (isLoading) return <Fragment />;
  return (
    <EntityProvider
      data={{
        atlas,
        atlasSourceDatasets,
        componentAtlas,
        componentAtlasSourceDatasets,
      }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      <ConditionalComponent
        isIn={shouldRenderView(
          canView,
          Boolean(
            atlas &&
              componentAtlas &&
              componentAtlasSourceDatasets &&
              atlasSourceDatasets
          )
        )}
      >
        <DetailView
          actions={
            canEdit &&
            componentAtlas && (
              <StyledFileArchivedStatus
                isArchived={componentAtlas.isArchived}
                payload={mapPayload(componentAtlas)}
                options={{
                  onSuccess: () =>
                    fetchDataDispatch(fetchData([INTEGRATED_OBJECT])),
                }}
              />
            )
          }
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <ViewComponentAtlas
              componentAtlasSourceDatasets={componentAtlasSourceDatasets}
              formManager={formManager}
              formMethod={formMethod}
              pathParameter={pathParameter}
              sectionConfigs={VIEW_INTEGRATED_OBJECT_SECTION_CONFIGS}
              atlasSourceDatasets={atlasSourceDatasets}
            />
          }
          tabs={<Tabs pathParameter={pathParameter} tabs={getTabs()} />}
          title={componentAtlas?.title || "Integrated Object"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};

/**
 * Returns the payload for file archiving or unarchiving.
 * @param integratedObject - Integrated object.
 * @returns Payload for file archiving or unarchiving.
 */
function mapPayload(integratedObject: HCAAtlasTrackerComponentAtlas): Payload {
  return { fileIds: [integratedObject.fileId] };
}
