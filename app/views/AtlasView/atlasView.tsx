import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
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
  atlasId: AtlasId;
}

export const AtlasView = ({ atlasId }: AtlasViewProps): JSX.Element => {
  const formMethod = useEditAtlasForm(atlasId);
  const formManager = useEditAtlasFormManager(atlasId, formMethod);
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
            atlasId={atlasId}
            onNavigate={formAction?.onNavigate}
          />
        }
        title={atlas ? getAtlasName(atlas) : "View Atlas"}
      />
    </ConditionalComponent>
  );
};
