import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { AtlasId } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { AddSourceStudy } from "../../components/Detail/components/AddSourceDataset/addSourceDataset";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useAddSourceStudyForm } from "./hooks/useAddSourceDatasetForm";
import { useAddSourceStudyFormManager } from "./hooks/useAddSourceDatasetFormManager";

interface AddNewSourceStudyViewProps {
  atlasId: AtlasId;
}

export const AddNewSourceStudyView = ({
  atlasId,
}: AddNewSourceStudyViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(atlasId);
  const formMethod = useAddSourceStudyForm();
  const formManager = useAddSourceStudyFormManager(atlasId, formMethod);
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent isIn={shouldRenderView(canView, Boolean(atlas))}>
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(atlasId, atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <AddSourceStudy formManager={formManager} formMethod={formMethod} />
        }
        title="Add Source Study"
      />
    </ConditionalComponent>
  );
};
