import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewAtlasSourceDatasets } from "../../components/Detail/components/ViewAtlasSourceDatasets/viewAtlasSourceDatasets";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
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
        status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
        tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
        title={atlas ? getAtlasName(atlas) : "View Source Datasets"}
      />
    </ConditionalComponent>
  );
};
