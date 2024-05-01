import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
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
    <ConditionalComponent
      isIn={shouldRenderView(formMethod.isAuthenticated, Boolean(atlas))}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(atlasId, atlas)} />
        }
        mainColumn={
          <AddSourceDataset atlasId={atlasId} formMethod={formMethod} />
        }
        title="Add Source Dataset"
      />
    </ConditionalComponent>
  );
};
