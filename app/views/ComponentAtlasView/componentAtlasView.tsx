import { HCAAtlasTrackerComponentAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "@/app/components/Entity/components/common/Tabs/tabs";
import { EntityForm } from "@/app/components/Entity/components/EntityForm/entityForm";
import { useBackPath } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { Payload } from "@/app/hooks/UseEditFileArchived/entities";
import { useFetchAtlas } from "@/app/hooks/useFetchAtlas";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { EntityProvider } from "@/app/providers/entity/provider";
import { fetchData } from "@/app/providers/fetchDataState/actions/fetchData/dispatch";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment, JSX } from "react";
import { VIEW_INTEGRATED_OBJECT_SECTION_CONFIGS } from "./common/sections";
import { getBreadcrumbs, getTabs } from "./common/utils";
import { StyledFileArchivedStatus } from "./componentAtlasView.styles";
import { useEditIntegratedObjectFormManager } from "./hooks/useEditIntegratedObjectFormManager";
import { INTEGRATED_OBJECT } from "./hooks/useFetchComponentAtlas";
import { useViewComponentAtlasForm } from "./hooks/useViewComponentAtlasForm";

interface ComponentAtlasViewProps {
  pathParameter: PathParameter;
}

export const ComponentAtlasView = ({
  pathParameter,
}: ComponentAtlasViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { fetchDataDispatch } = useFetchDataState();
  const formMethod = useViewComponentAtlasForm(pathParameter);
  const formManager = useEditIntegratedObjectFormManager(
    pathParameter,
    formMethod,
  );
  const {
    access: { canEdit },
    formAction,
    isLoading,
  } = formManager;
  const { data: componentAtlas } = formMethod;
  const backPath = useBackPath(pathParameter);

  if (isLoading) return <Fragment />;

  return (
    <EntityProvider
      data={{ atlas, componentAtlas }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      <ConditionalComponent isIn={Boolean(atlas && componentAtlas)}>
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
              sectionConfigs={VIEW_INTEGRATED_OBJECT_SECTION_CONFIGS}
            />
          }
          tabs={
            <Tabs
              onNavigate={formAction?.onNavigate}
              pathParameter={pathParameter}
              tabs={getTabs(componentAtlas)}
            />
          }
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
