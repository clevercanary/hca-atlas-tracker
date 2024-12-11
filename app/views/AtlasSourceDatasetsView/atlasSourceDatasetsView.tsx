import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewAtlasSourceDatasets } from "../../components/Detail/components/ViewAtlasSourceDatasets/viewAtlasSourceDatasets";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { getBreadcrumbs } from "./common/utils";
import { useFetchAtlasSourceDatasetsData } from "./hooks/useFetchAtlasSourceDatasetsData";

interface AtlasSourceDatasetsViewProps {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetsView = ({
  pathParameter,
}: AtlasSourceDatasetsViewProps): JSX.Element => {
  const atlasSourceDatasetsData =
    useFetchAtlasSourceDatasetsData(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
    isLoading,
  } = formManager;
  const { atlas, atlasSourceDatasets, sourceStudiesSourceDatasets } =
    atlasSourceDatasetsData;
  if (isLoading) return <Fragment />;
  return (
    <ConditionalComponent
      isIn={shouldRenderView(
        canView,
        Boolean(atlas && atlasSourceDatasets && sourceStudiesSourceDatasets)
      )}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={
          <ViewAtlasSourceDatasets
            atlasSourceDatasets={atlasSourceDatasets}
            formManager={formManager}
            pathParameter={pathParameter}
            sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
          />
        }
        tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
        title="Source Datasets"
      />
    </ConditionalComponent>
  );
};
