import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment, JSX } from "react";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { AtlasStatuses } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { StyledDetailView } from "../../components/Layout/components/Detail/sticky/detailView.styles";
import { useAtlasTabBackPath } from "../../hooks/useAtlasTabBackPath";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { useFetchSourceStudies } from "../SourceStudiesView/hooks/useFetchSourceStudies";
import { VIEW_ATLAS_SOURCE_DATASETS_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs } from "./common/utils";
import { useFetchAtlasSourceDatasets } from "./hooks/useFetchAtlasSourceDatasets";

interface AtlasSourceDatasetsViewProps {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetsView = ({
  pathParameter,
}: AtlasSourceDatasetsViewProps): JSX.Element => {
  const formManager = useFormManager();
  const { isLoading } = formManager;
  const { atlas } = useFetchAtlas(pathParameter);
  const { atlasSourceDatasets } = useFetchAtlasSourceDatasets(pathParameter);
  const { sourceStudies } = useFetchSourceStudies(pathParameter);
  const backPath = useAtlasTabBackPath(pathParameter);

  if (isLoading) return <Fragment />;

  return (
    <EntityProvider
      data={{ atlas, atlasSourceDatasets, sourceStudies }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      <ConditionalComponent isIn={Boolean(atlas && atlasSourceDatasets)}>
        <StyledDetailView
          backPath={backPath}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              sectionConfigs={VIEW_ATLAS_SOURCE_DATASETS_SECTION_CONFIGS}
            />
          }
          status={atlas && <AtlasStatuses statuses={atlas} />}
          tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
          title={atlas ? getAtlasName(atlas) : "View Source Datasets"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};
