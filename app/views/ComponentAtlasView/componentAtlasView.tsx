import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ViewComponentAtlas } from "../../components/Detail/components/ViewComponentAtlas/viewComponentAtlas";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { VIEW_COMPONENT_ATLAS_VIEW_SECTION_CONFIGS } from "./common/sections";
import { getBreadcrumbs } from "./common/utils";
import { useFetchComponentAtlasData } from "./hooks/useFetchComponentAtlasData";
import { useViewComponentAtlasForm } from "./hooks/useViewComponentAtlasForm";

interface ComponentAtlasViewProps {
  pathParameter: PathParameter;
}

export const ComponentAtlasView = ({
  pathParameter,
}: ComponentAtlasViewProps): JSX.Element => {
  const componentAtlasData = useFetchComponentAtlasData(pathParameter);
  const formMethod = useViewComponentAtlasForm(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
    isLoading,
  } = formManager;
  const { data: componentAtlas } = formMethod;
  const { atlas, componentAtlasSourceDatasets, sourceStudiesSourceDatasets } =
    componentAtlasData;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(
        canView,
        Boolean(
          atlas &&
            componentAtlas &&
            componentAtlasSourceDatasets &&
            sourceStudiesSourceDatasets
        )
      )}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={
          <ViewComponentAtlas
            componentAtlasSourceDatasets={componentAtlasSourceDatasets}
            formManager={formManager}
            formMethod={formMethod}
            pathParameter={pathParameter}
            sectionConfigs={VIEW_COMPONENT_ATLAS_VIEW_SECTION_CONFIGS}
            sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
          />
        }
        title={componentAtlas?.title || "Integration Object"}
      />
    </ConditionalComponent>
  );
};
