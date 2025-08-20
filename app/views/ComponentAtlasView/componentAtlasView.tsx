import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { ViewComponentAtlas } from "../../components/Detail/components/ViewComponentAtlas/viewComponentAtlas";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useEditComponentAtlasForm } from "./hooks/useEditComponentAtlasForm";
import { useEditComponentAtlasFormManager } from "./hooks/useEditComponentAtlasFormManager";
import { useFetchComponentAtlasData } from "./hooks/useFetchComponentAtlasData";

interface ComponentAtlasViewProps {
  pathParameter: PathParameter;
}

export const ComponentAtlasView = ({
  pathParameter,
}: ComponentAtlasViewProps): JSX.Element => {
  const componentAtlasData = useFetchComponentAtlasData(pathParameter);
  const formMethod = useEditComponentAtlasForm(pathParameter);
  const formManager = useEditComponentAtlasFormManager(
    pathParameter,
    formMethod
  );
  const {
    access: { canView },
    formAction,
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
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewComponentAtlas
            componentAtlasSourceDatasets={componentAtlasSourceDatasets}
            formManager={formManager}
            formMethod={formMethod}
            pathParameter={pathParameter}
            sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
          />
        }
        title={componentAtlas?.title || "Integration Object"}
      />
    </ConditionalComponent>
  );
};
