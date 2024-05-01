import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/EditAtlas/components/Tabs/tabs";
import { EditAtlas } from "../../components/Detail/components/EditAtlas/editAtlas";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { getBreadcrumbs } from "./common/utils";
import { useEditAtlasForm } from "./hooks/useEditAtlasForm";

interface EditAtlasViewProps {
  atlasId: AtlasId;
}

export const EditAtlasView = ({ atlasId }: EditAtlasViewProps): JSX.Element => {
  const formMethod = useEditAtlasForm(atlasId);
  const { data: atlas } = formMethod;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(formMethod.isAuthenticated, Boolean(atlas))}
    >
      <DetailView
        breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs(atlas)} />}
        mainColumn={<EditAtlas atlasId={atlasId} formMethod={formMethod} />}
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} atlasId={atlasId} />}
        title={atlas ? getAtlasName(atlas) : "Edit Atlas"}
      />
    </ConditionalComponent>
  );
};
