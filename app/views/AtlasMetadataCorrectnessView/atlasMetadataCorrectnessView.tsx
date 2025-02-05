import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewAtlasMetadataCorrectness } from "../../components/Detail/components/ViewAtlasMetadataCorrectness/viewAtlasMetadataCorrectness";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { getBreadcrumbs } from "./common/utils";

interface AtlasMetadataCorrectnessView {
  pathParameter: PathParameter;
}

export const AtlasMetadataCorrectnessView = ({
  pathParameter,
}: AtlasMetadataCorrectnessView): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
  } = formManager;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={
          <ViewAtlasMetadataCorrectness
            atlas={atlas}
            formManager={formManager}
          />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
        title={atlas ? getAtlasName(atlas) : "View Integration Objects"}
      />
    </ConditionalComponent>
  );
};
