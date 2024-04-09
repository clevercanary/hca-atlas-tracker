import { Breadcrumbs } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { AddSourceDataset } from "../../components/Detail/components/AddSourceDataset/addSourceDataset";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useAddSourceDatasetForm } from "./hooks/useAddSourceDatasetForm";

interface AddNewSourceDatasetViewProps {
  atlasId: AtlasId;
}

export const AddNewSourceDatasetView = ({
  atlasId,
}: AddNewSourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useAddSourceDatasetForm();
  return (
    <DetailView
      breadcrumbs={
        <Breadcrumbs breadcrumbs={getBreadcrumbs(atlasId, atlas?.atlasName)} />
      }
      mainColumn={
        <AddSourceDataset atlasId={atlasId} formMethod={formMethod} />
      }
      title="Add Source Dataset"
    />
  );
};
