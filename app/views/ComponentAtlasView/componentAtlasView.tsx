import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX, Fragment } from "react";
import { HCAAtlasTrackerComponentAtlas } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { EntityForm } from "../../components/Entity/components/EntityForm/entityForm";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { Payload } from "../../hooks/UseEditFileArchived/entities";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFetchDataState } from "../../hooks/useFetchDataState";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { EntityProvider } from "../../providers/entity/provider";
import { fetchData } from "../../providers/fetchDataState/actions/fetchData/dispatch";
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
    access: { canEdit, canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: componentAtlas } = formMethod;
  if (isLoading) return <Fragment />;
  return (
    <EntityProvider
      data={{ atlas, componentAtlas }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(atlas && componentAtlas))}
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
            <Breadcrumbs
              breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
              onNavigate={formAction?.onNavigate}
            />
          }
          mainColumn={
            <EntityForm
              accessFallback={renderAccessFallback(formManager)}
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

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <AccessPrompt text="to view the integrated object" />;
  return null;
}
