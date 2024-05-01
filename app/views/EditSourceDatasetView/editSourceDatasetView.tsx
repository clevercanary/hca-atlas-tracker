import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import {
  AtlasId,
  SourceDatasetId,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { EditSourceDataset } from "../../components/Detail/components/EditSourceDataset/editSourceDataset";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import {
  mapPublicationStatus,
  useEditSourceDatasetForm,
} from "./hooks/useEditSourceDatasetForm";

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
  const { data: sourceDataset } = formMethod;
  const { doi } = sourceDataset || {};
  return (
    <ConditionalComponent
      isIn={shouldRenderView(
        formMethod.isAuthenticated,
        Boolean(atlas && sourceDataset)
      )}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlasId, atlas, sourceDataset)}
          />
        }
        mainColumn={
          <EditSourceDataset
            atlasId={atlasId}
            formMethod={formMethod}
            sdId={sdId}
            sdPublicationStatus={mapPublicationStatus(doi)}
          />
        }
        title={sourceDataset?.title || "Edit Source Dataset"}
      />
    </ConditionalComponent>
  );
};
