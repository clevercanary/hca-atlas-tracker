import { Breadcrumbs } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { Tabs } from "../../components/Detail/components/EditAtlas/components/Tabs/tabs";
import { ViewSourceDatasets } from "../../components/Detail/components/ViewSourceDatasets/viewSourceDatasets";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "../EditAtlasView/common/utils";

interface ViewSourceDatasetsViewProps {
  atlasId: AtlasId;
}

export const ViewSourceDatasetsView = ({
  atlasId,
}: ViewSourceDatasetsViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  return (
    <DetailView
      breadcrumbs={<Breadcrumbs breadcrumbs={getBreadcrumbs(atlas)} />}
      mainColumn={
        <ViewSourceDatasets
          atlasId={atlasId}
          sourceDatasets={atlas?.sourceDatasets}
        />
      }
      status={atlas && <AtlasStatus atlasStatus={atlas?.status} />}
      tabs={<Tabs atlas={atlas} atlasId={atlasId} />}
      title={atlas?.atlasName || "Edit Atlas"}
    />
  );
};
