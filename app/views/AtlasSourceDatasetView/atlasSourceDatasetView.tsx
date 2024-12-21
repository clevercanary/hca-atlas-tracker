import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS } from "../../components/Detail/components/TrackerForm/components/Section/components/AtlasSourceDataset/common/sections";
import { ViewAtlasSourceDataset } from "../../components/Detail/components/ViewAtlasSourceDataset/viewAtlasSourceDataset";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { getBreadcrumbs } from "./common/utils";
import { useEditAtlasSourceDatasetForm } from "./hooks/useEditAtlasSourceDatasetForm";
import { useEditAtlasSourceDatasetFormManager } from "./hooks/useEditAtlasSourceDatasetFormManager";

interface AtlasSourceDatasetViewProps {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetView = ({
  pathParameter,
}: AtlasSourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const formMethod = useEditAtlasSourceDatasetForm(pathParameter);
  const formManager = useEditAtlasSourceDatasetFormManager(
    pathParameter,
    formMethod
  );
  const {
    access: { canView },
    formAction,
    isLoading,
  } = formManager;
  const { data: sourceDataset } = formMethod;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceDataset))}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs
            breadcrumbs={getBreadcrumbs(pathParameter, atlas)}
            onNavigate={formAction?.onNavigate}
          />
        }
        mainColumn={
          <ViewAtlasSourceDataset
            formManager={formManager}
            formMethod={formMethod}
            pathParameter={pathParameter}
            sectionConfigs={VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS}
          />
        }
        subTitle={sourceDataset?.publicationString}
        title={sourceDataset?.title || "Source Dataset"}
      />
    </ConditionalComponent>
  );
};
