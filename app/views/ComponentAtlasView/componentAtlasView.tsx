import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "../../components/Detail/components/ViewComponentAtlas/components/Actions/actions";
import { ViewComponentAtlas } from "../../components/Detail/components/ViewComponentAtlas/viewComponentAtlas";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useEditComponentAtlasForm } from "./hooks/useEditComponentAtlasForm";
import { useEditComponentAtlasFormManager } from "./hooks/useEditComponentAtlasFormManager";
import { useFetchComponentAtlasSourceDatasets } from "./hooks/useFetchComponentAtlasSourceDatasets";

interface ComponentAtlasViewProps {
  pathParameter: PathParameter;
}

export const ComponentAtlasView = ({
  pathParameter,
}: ComponentAtlasViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { componentAtlasSourceDatasets } =
    useFetchComponentAtlasSourceDatasets(pathParameter);
  const formMethod = useEditComponentAtlasForm(pathParameter);
  const formManager = useEditComponentAtlasFormManager(
    pathParameter,
    formMethod
  );
  const {
    access: { canEdit, canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: componentAtlas } = formMethod;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(
        canView,
        Boolean(atlas && componentAtlas && componentAtlasSourceDatasets)
      )}
    >
      <DetailView
        actions={canEdit && <Actions formManager={formManager} />}
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas, componentAtlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewComponentAtlas
            componentAtlasSourceDatasets={componentAtlasSourceDatasets}
            formManager={formManager}
            formMethod={formMethod}
            pathParameter={pathParameter}
          />
        }
        title={componentAtlas?.title || "Component Atlas"}
      />
    </ConditionalComponent>
  );
};
