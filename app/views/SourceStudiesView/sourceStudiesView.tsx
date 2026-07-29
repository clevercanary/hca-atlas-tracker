import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX } from "react";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewSourceStudies } from "../../components/Detail/components/ViewSourceStudies/viewSourceStudies";
import { AtlasStatuses } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { StyledDetailView } from "../../components/Layout/components/Detail/sticky/detailView.styles";
import { useAtlasTabBackPath } from "../../hooks/useAtlasTabBackPath";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { getBreadcrumbs } from "./common/utils";
import { useFetchSourceStudies } from "./hooks/useFetchSourceStudies";

interface SourceStudiesViewProps {
  pathParameter: PathParameter;
}

export const SourceStudiesView = ({
  pathParameter,
}: SourceStudiesViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { sourceStudies } = useFetchSourceStudies(pathParameter);
  const formManager = useFormManager();
  const backPath = useAtlasTabBackPath(pathParameter);
  return (
    <EntityProvider
      data={{ sourceStudies }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      <ConditionalComponent isIn={Boolean(atlas && sourceStudies)}>
        <StyledDetailView
          backPath={backPath}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <ViewSourceStudies
              formManager={formManager}
              pathParameter={pathParameter}
            />
          }
          status={atlas && <AtlasStatuses statuses={atlas} />}
          tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
          title={atlas ? getAtlasName(atlas) : "View Source Studies"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};
