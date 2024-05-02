import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/EditAtlas/components/Tabs/tabs";
import { EditAtlas } from "../../components/Detail/components/EditAtlas/editAtlas";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useEditAtlasForm } from "./hooks/useEditAtlasForm";
import { useEditAtlasFormManager } from "./hooks/useEditAtlasFormManager";

interface EditAtlasViewProps {
  atlasId: AtlasId;
}

export const EditAtlasView = ({ atlasId }: EditAtlasViewProps): JSX.Element => {
  const formMethod = useEditAtlasForm(atlasId);
  const formManager = useEditAtlasFormManager(atlasId, formMethod);
  const {
    access: { canView },
  } = formManager;
  const { data: atlas } = formMethod;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlas)}
            onNavigate={formManager.onNavigate}
          />
        }
        mainColumn={
          <EditAtlas formManager={formManager} formMethod={formMethod} />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={
          <Tabs
            atlas={atlas}
            atlasId={atlasId}
            onNavigate={formManager.onNavigate}
          />
        }
        title={atlas ? getAtlasName(atlas) : "Edit Atlas"}
      />
    </ConditionalComponent>
  );
};
