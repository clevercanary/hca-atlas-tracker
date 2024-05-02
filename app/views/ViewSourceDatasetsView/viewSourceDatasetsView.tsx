import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/EditAtlas/components/Tabs/tabs";
import { ViewSourceDatasets } from "../../components/Detail/components/ViewSourceDatasets/viewSourceDatasets";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFetchSourceDatasets } from "../../hooks/useFetchSourceDatasets";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { getBreadcrumbs } from "../EditAtlasView/common/utils";

interface ViewSourceDatasetsViewProps {
  atlasId: AtlasId;
}

export const ViewSourceDatasetsView = ({
  atlasId,
}: ViewSourceDatasetsViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const { sourceDatasets } = useFetchSourceDatasets(atlasId);
  const formManager = useFormManager();
  const {
    access: { canView },
  } = formManager;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceDatasets))}
    >
      <DetailView
        breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs(atlas)} />}
        mainColumn={
          <ViewSourceDatasets
            atlasId={atlasId}
            formManager={formManager}
            sourceDatasets={sourceDatasets}
          />
        }
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} atlasId={atlasId} />}
        title={atlas ? getAtlasName(atlas) : "Edit Atlas"}
      />
    </ConditionalComponent>
  );
};
