import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { getTabs } from "../ComponentAtlasView/common/utils";
import { useFetchComponentAtlas } from "../ComponentAtlasView/hooks/useFetchComponentAtlas";
import { VIEW_INTEGRATED_OBJECT_SOURCE_DATASETS_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs } from "./common/utils";
import { useFetchAssociatedAtlasSourceDatasets } from "./hooks/useFetchAssociatedAtlasSourceDatasets";
import { useFetchIntegratedObjectSourceDatasets } from "./hooks/useFetchIntegratedObjectSourceDatasets";

interface Props {
  pathParameter: PathParameter;
}

export const IntegratedObjectSourceDatasetsView = ({
  pathParameter,
}: Props): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { atlasSourceDatasets } =
    useFetchAssociatedAtlasSourceDatasets(pathParameter);
  const { componentAtlas } = useFetchComponentAtlas(pathParameter);
  const { integratedObjectSourceDatasets } =
    useFetchIntegratedObjectSourceDatasets(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
    isLoading,
  } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <EntityProvider
      data={{
        atlas,
        atlasSourceDatasets,
        componentAtlas,
        integratedObjectSourceDatasets,
      }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(atlas && componentAtlas))}
      >
        <DetailView
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              accessFallback={renderAccessFallback(formManager)}
              sectionConfigs={
                VIEW_INTEGRATED_OBJECT_SOURCE_DATASETS_SECTION_CONFIGS
              }
            />
          }
          tabs={<Tabs pathParameter={pathParameter} tabs={getTabs()} />}
          title={componentAtlas?.title || "Integrated Object Source Datasets"}
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
    access: { canView },
  } = formManager;
  if (!canView)
    return (
      <AccessPrompt text="to view the integrated object source datasets" />
    );
  return null;
}
