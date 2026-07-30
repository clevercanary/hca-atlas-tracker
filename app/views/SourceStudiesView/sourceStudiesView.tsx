import { getAtlasName } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "@/app/common/entities";
import { Tabs } from "@/app/components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewSourceStudies } from "@/app/components/Detail/components/ViewSourceStudies/viewSourceStudies";
import { AtlasStatuses } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { StyledDetailView } from "@/app/components/Layout/components/Detail/sticky/detailView.styles";
import { useAtlasTabBackPath } from "@/app/hooks/useAtlasTabBackPath";
import { useFetchAtlas } from "@/app/hooks/UseFetchAtlas/hook";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { EntityProvider } from "@/app/providers/entity/provider";
import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX } from "react";
import { getBreadcrumbs } from "./common/utils";
import { useFetchSourceStudies } from "./hooks/UseFetchSourceStudies/hook";

interface SourceStudiesViewProps {
  pathParameter: PathParameter;
}

export const SourceStudiesView = ({
  pathParameter,
}: SourceStudiesViewProps): JSX.Element => {
  const { data: atlas } = useFetchAtlas(pathParameter);
  const { data: sourceStudies } = useFetchSourceStudies(pathParameter);
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
