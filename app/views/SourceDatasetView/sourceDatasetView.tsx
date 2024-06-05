import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import {
  AtlasId,
  SourceStudyId,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "../../components/Detail/components/ViewSourceDataset/components/Actions/actions";
import { ViewSourceDataset } from "../../components/Detail/components/ViewSourceDataset/viewSourceDataset";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import {
  mapPublicationStatus,
  useEditSourceDatasetForm,
} from "./hooks/useEditSourceDatasetForm";
import { useEditSourceDatasetFormManager } from "./hooks/useEditSourceDatasetFormManager";

interface SourceDatasetViewProps {
  atlasId: AtlasId;
  sourceStudyId: SourceStudyId;
}

export const SourceDatasetView = ({
  atlasId,
  sourceStudyId,
}: SourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useEditSourceDatasetForm(atlasId, sourceStudyId);
  const formManager = useEditSourceDatasetFormManager(
    atlasId,
    sourceStudyId,
    formMethod
  );
  const {
    access: { canEdit, canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: sourceDataset } = formMethod;
  const { doi } = sourceDataset || {};
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceDataset))}
    >
      <DetailView
        actions={canEdit && <Actions formManager={formManager} />}
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlasId, atlas, sourceDataset)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewSourceDataset
            formManager={formManager}
            formMethod={formMethod}
            sdPublicationStatus={mapPublicationStatus(doi)}
          />
        }
        title={sourceDataset?.title || "Source Dataset"}
      />
    </ConditionalComponent>
  );
};
