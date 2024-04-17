import { Breadcrumbs } from "@clevercanary/data-explorer-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import {
  AtlasId,
  SourceDatasetId,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { EditSourceDataset } from "../../components/Detail/components/EditSourceDataset/editSourceDataset";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFetchSourceDataset } from "../../hooks/useFetchSourceDataset";
import { getBreadcrumbs } from "./common/utils";
import { useEditSourceDatasetForm } from "./hooks/useEditSourceDatasetForm";

interface EditSourceDatasetViewProps {
  atlasId: AtlasId;
  sdId: SourceDatasetId;
}

export const EditSourceDatasetView = ({
  atlasId,
  sdId,
}: EditSourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const { sourceDataset } = useFetchSourceDataset(atlasId, sdId);
  const formMethod = useEditSourceDatasetForm(sourceDataset);
  return (
    <DetailView
      breadcrumbs={
        <Breadcrumbs
          breadcrumbs={getBreadcrumbs(atlasId, atlas, sourceDataset)}
        />
      }
      mainColumn={<EditSourceDataset formMethod={formMethod} />}
      title={sourceDataset?.title || "Edit Source Dataset"}
    />
  );
};
