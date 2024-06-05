import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewSourceStudies } from "../../components/Detail/components/ViewSourceStudies/viewSourceStudies";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFetchSourceStudies } from "../../hooks/useFetchSourceStudies";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { getBreadcrumbs } from "../AtlasView/common/utils";

interface SourceStudiesViewProps {
  atlasId: AtlasId;
}

export const SourceStudiesView = ({
  atlasId,
}: SourceStudiesViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const { sourceStudies } = useFetchSourceStudies(atlasId);
  const formManager = useFormManager();
  const {
    access: { canView },
  } = formManager;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceStudies))}
    >
      <DetailView
        breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs(atlas)} />}
        mainColumn={
          <ViewSourceStudies
            atlasId={atlasId}
            formManager={formManager}
            sourceStudies={sourceStudies}
          />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} atlasId={atlasId} />}
        title={atlas ? getAtlasName(atlas) : "View Source Studies"}
      />
    </ConditionalComponent>
  );
};
