import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import {
  AtlasId,
  SourceStudyId,
} from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Actions } from "../../components/Detail/components/ViewSourceDataset/components/Actions/actions";
import { ViewSourceStudy } from "../../components/Detail/components/ViewSourceDataset/viewSourceDataset";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import {
  mapPublicationStatus,
  useEditSourceStudyForm,
} from "./hooks/useEditSourceDatasetForm";
import { useEditSourceStudyFormManager } from "./hooks/useEditSourceDatasetFormManager";

interface SourceStudyViewProps {
  atlasId: AtlasId;
  sourceStudyId: SourceStudyId;
}

export const SourceStudyView = ({
  atlasId,
  sourceStudyId,
}: SourceStudyViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useEditSourceStudyForm(atlasId, sourceStudyId);
  const formManager = useEditSourceStudyFormManager(
    atlasId,
    sourceStudyId,
    formMethod
  );
  const {
    access: { canEdit, canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: sourceStudy } = formMethod;
  const { doi } = sourceStudy || {};
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceStudy))}
    >
      <DetailView
        actions={canEdit && <Actions formManager={formManager} />}
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlasId, atlas, sourceStudy)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewSourceStudy
            formManager={formManager}
            formMethod={formMethod}
            sdPublicationStatus={mapPublicationStatus(doi)}
          />
        }
        title={sourceStudy?.title || "Source Dataset"}
      />
    </ConditionalComponent>
  );
};
