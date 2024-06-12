import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewAtlas } from "../../components/Detail/components/ViewAtlas/viewAtlas";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useEditAtlasForm } from "./hooks/useEditAtlasForm";
import { useEditAtlasFormManager } from "./hooks/useEditAtlasFormManager";

interface AtlasViewProps {
  pathParameter: PathParameter;
}

export const AtlasView = ({ pathParameter }: AtlasViewProps): JSX.Element => {
  const formMethod = useEditAtlasForm(pathParameter);
  const formManager = useEditAtlasFormManager(pathParameter, formMethod);
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: atlas } = formMethod;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewAtlas formManager={formManager} formMethod={formMethod} />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={
          <Tabs
            atlas={atlas}
            onNavigate={formAction?.onNavigate}
            pathParameter={pathParameter}
          />
        }
        title={atlas ? getAtlasName(atlas) : "View Atlas"}
      />
    </ConditionalComponent>
  );
};
