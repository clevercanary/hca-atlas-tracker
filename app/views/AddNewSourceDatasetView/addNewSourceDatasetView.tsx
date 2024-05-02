import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { AddSourceDataset } from "../../components/Detail/components/AddSourceDataset/addSourceDataset";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useAddSourceDatasetForm } from "./hooks/useAddSourceDatasetForm";
import { useAddSourceDatasetFormManager } from "./hooks/useAddSourceDatasetFormManager";

interface AddNewSourceDatasetViewProps {
  atlasId: AtlasId;
}

export const AddNewSourceDatasetView = ({
  atlasId,
}: AddNewSourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useAddSourceDatasetForm();
  const formManager = useAddSourceDatasetFormManager(atlasId, formMethod);
  const {
    access: { canView },
  } = formManager;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlasId, atlas)}
            onNavigate={formManager.onNavigate}
          />
        }
        mainColumn={
          <AddSourceDataset formManager={formManager} formMethod={formMethod} />
        }
        title="Add Source Dataset"
      />
    </ConditionalComponent>
  );
};
