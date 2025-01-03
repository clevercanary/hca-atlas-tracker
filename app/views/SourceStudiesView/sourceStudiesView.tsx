import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewSourceStudies } from "../../components/Detail/components/ViewSourceStudies/viewSourceStudies";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFetchSourceStudiesSourceDatasets } from "../../hooks/useFetchSourceStudiesSourceDatasets";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { useFetchAtlasSourceDatasets } from "../AtlasSourceDatasetsView/hooks/useFetchAtlasSourceDatasets";
import { getBreadcrumbs } from "./common/utils";
import { useFetchSourceStudies } from "./hooks/useFetchSourceStudies";

interface SourceStudiesViewProps {
  pathParameter: PathParameter;
}

export const SourceStudiesView = ({
  pathParameter,
}: SourceStudiesViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { sourceStudies } = useFetchSourceStudies(pathParameter);
  const { atlasSourceDatasets } = useFetchAtlasSourceDatasets(pathParameter);
  const sourceStudiesSourceDatasets =
    useFetchSourceStudiesSourceDatasets(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
  } = formManager;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceStudies))}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={
          <ViewSourceStudies
            atlasSourceDatasets={atlasSourceDatasets}
            formManager={formManager}
            pathParameter={pathParameter}
            sourceStudies={sourceStudies}
            sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
          />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
        title={atlas ? getAtlasName(atlas) : "View Source Studies"}
      />
    </ConditionalComponent>
  );
};
