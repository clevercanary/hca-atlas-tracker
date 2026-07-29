import { PathParameter } from "@/app/common/entities";
import { Breadcrumbs } from "@/app/components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "@/app/components/Entity/components/common/Tabs/tabs";
import { EntityView } from "@/app/components/Entity/components/EntityView/entityView";
import { StyledDetailView } from "@/app/components/Layout/components/Detail/sticky/detailView.styles";
import { useFetchAtlas } from "@/app/hooks/UseFetchAtlas/hook";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { EntityProvider } from "@/app/providers/entity/provider";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment, JSX } from "react";
import { getTabs } from "../ComponentAtlasView/common/utils";
import { useFetchComponentAtlas } from "../ComponentAtlasView/hooks/useFetchComponentAtlas";
import { VIEW_INTEGRATED_OBJECT_SOURCE_DATASETS_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs } from "./common/utils";
import { useEditIntegratedObjectSourceDatasets } from "./hooks/useEditIntegratedObjectSourceDatasets";
import { useFetchAssociatedAtlasSourceDatasets } from "./hooks/useFetchAssociatedAtlasSourceDatasets";
import { useFetchIntegratedObjectSourceDatasets } from "./hooks/useFetchIntegratedObjectSourceDatasets";
import { EditIntegratedObjectSourceDatasetsContext } from "./providers/editIntegratedObjectSourceDatasets/context";
interface Props {
  pathParameter: PathParameter;
}

export const IntegratedObjectSourceDatasetsView = ({
  pathParameter,
}: Props): JSX.Element => {
  const { onDelete } = useEditIntegratedObjectSourceDatasets(pathParameter);
  const { data: atlas } = useFetchAtlas(pathParameter);
  const { atlasSourceDatasets } =
    useFetchAssociatedAtlasSourceDatasets(pathParameter);
  const { componentAtlas } = useFetchComponentAtlas(pathParameter);
  const { integratedObjectSourceDatasets } =
    useFetchIntegratedObjectSourceDatasets(pathParameter);
  const formManager = useFormManager();
  const { isLoading } = formManager;
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
      <EditIntegratedObjectSourceDatasetsContext.Provider value={{ onDelete }}>
        <ConditionalComponent isIn={Boolean(atlas && componentAtlas)}>
          <StyledDetailView
            breadcrumbs={
              <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
            }
            mainColumn={
              <EntityView
                sectionConfigs={
                  VIEW_INTEGRATED_OBJECT_SOURCE_DATASETS_SECTION_CONFIGS
                }
              />
            }
            tabs={
              <Tabs
                pathParameter={pathParameter}
                tabs={getTabs(componentAtlas)}
              />
            }
            title={componentAtlas?.title || "Integrated Object Source Datasets"}
          />
        </ConditionalComponent>
      </EditIntegratedObjectSourceDatasetsContext.Provider>
    </EntityProvider>
  );
};
