import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import {
  AtlasId,
  SourceDatasetId,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { EditSourceDataset } from "../../components/Detail/components/EditSourceDataset/editSourceDataset";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import {
  mapPublicationStatus,
  useEditSourceDatasetForm,
} from "./hooks/useEditSourceDatasetForm";
import { useEditSourceDatasetFormManager } from "./hooks/useEditSourceDatasetFormManager";

interface EditSourceDatasetViewProps {
  atlasId: AtlasId;
  sdId: SourceDatasetId;
}

export const EditSourceDatasetView = ({
  atlasId,
  sdId,
}: EditSourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useEditSourceDatasetForm(atlasId, sdId);
  const formManager = useEditSourceDatasetFormManager(
    atlasId,
    sdId,
    formMethod
  );
  const {
    access: { canView },
    formAction,
  } = formManager;
  const { data: sourceDataset } = formMethod;
  const { doi } = sourceDataset || {};
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceDataset))}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlasId, atlas, sourceDataset)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <EditSourceDataset
            formManager={formManager}
            formMethod={formMethod}
            sdPublicationStatus={mapPublicationStatus(doi)}
          />
        }
        title={sourceDataset?.title || "Edit Source Dataset"}
      />
    </ConditionalComponent>
  );
};
