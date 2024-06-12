import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { AddComponentAtlas } from "../../components/Detail/components/AddComponentAtlas/addComponentAtlas";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useAddComponentAtlasForm } from "./hooks/useAddComponentAtlasForm";
import { useAddComponentAtlasFormManager } from "./hooks/useAddComponentAtlasFormManager";

interface AddNewComponentAtlasViewProps {
  pathParameter: PathParameter;
}

export const AddNewComponentAtlasView = ({
  pathParameter,
}: AddNewComponentAtlasViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const formMethod = useAddComponentAtlasForm();
  const formManager = useAddComponentAtlasFormManager(
    pathParameter,
    formMethod
  );
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <AddComponentAtlas
            formManager={formManager}
            formMethod={formMethod}
          />
        }
        title="Add Component Atlas"
      />
    </ConditionalComponent>
  );
};
