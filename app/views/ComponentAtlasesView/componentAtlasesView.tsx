import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewComponentAtlases } from "../../components/Detail/components/ViewComponentAtlases/viewComponentAtlases";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { getBreadcrumbs } from "../AtlasView/common/utils";
import { useFetchComponentAtlases } from "./hooks/useFetchComponentAtlases";

interface ComponentAtlasesViewProps {
  pathParameter: PathParameter;
}

export const ComponentAtlasesView = ({
  pathParameter,
}: ComponentAtlasesViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { componentAtlases } = useFetchComponentAtlases(pathParameter);
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
            formManager={formManager}
            componentAtlases={componentAtlases}
            pathParameter={pathParameter}
          />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
        title={atlas ? getAtlasName(atlas) : "View Component Atlases"}
      />
    </ConditionalComponent>
  );
};
