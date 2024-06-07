import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import {
  AtlasId,
  ComponentAtlasId,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "../../components/Detail/components/ViewComponentAtlas/components/Actions/actions";
import { ViewComponentAtlas } from "../../components/Detail/components/ViewComponentAtlas/viewComponentAtlas";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useEditComponentAtlasForm } from "./hooks/useEditComponentAtlasForm";
import { useEditComponentAtlasFormManager } from "./hooks/useEditComponentAtlasFormManager";

interface ComponentAtlasViewProps {
  atlasId: AtlasId;
  componentAtlasId: ComponentAtlasId;
}

export const ComponentAtlasView = ({
  atlasId,
  componentAtlasId,
}: ComponentAtlasViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useEditComponentAtlasForm(atlasId, componentAtlasId);
  const formManager = useEditComponentAtlasFormManager(
    atlasId,
    componentAtlasId,
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
      isIn={shouldRenderView(canView, Boolean(atlas && componentAtlas))}
    >
      <DetailView
        actions={canEdit && <Actions formManager={formManager} />}
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlasId, atlas, componentAtlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewComponentAtlas
            formManager={formManager}
            formMethod={formMethod}
          />
        }
        title={componentAtlas?.title || "Component Atlas"}
      />
    </ConditionalComponent>
  );
};
