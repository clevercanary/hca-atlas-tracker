import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewComponentAtlases } from "../../components/Detail/components/ViewComponentAtlases/viewComponentAtlases";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFetchComponentAtlases } from "../../hooks/useFetchComponentAtlases";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { getBreadcrumbs } from "../AtlasView/common/utils";

interface ComponentAtlasesViewProps {
  atlasId: AtlasId;
}

export const ComponentAtlasesView = ({
  atlasId,
}: ComponentAtlasesViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const { componentAtlases } = useFetchComponentAtlases(atlasId);
  const formManager = useFormManager();
  const {
    access: { canView },
  } = formManager;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && componentAtlases))}
    >
      <DetailView
        breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs(atlas)} />}
        mainColumn={
          <ViewComponentAtlases
            atlasId={atlasId}
            formManager={formManager}
            componentAtlases={componentAtlases}
          />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} atlasId={atlasId} />}
        title={atlas ? getAtlasName(atlas) : "View Component Atlases"}
      />
    </ConditionalComponent>
  );
};
