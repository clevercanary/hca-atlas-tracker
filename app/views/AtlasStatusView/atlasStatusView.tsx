import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX } from "react";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { getRouteURL } from "../../common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { AtlasStatuses } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { useBackPath } from "../../components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { ROUTE } from "../../routes/constants";
import { getBreadcrumbs } from "./common/utils";
import { StatusDashboard } from "./components/StatusDashboard/statusDashboard";
import { useFetchAtlasStatus } from "./hooks/useFetchAtlasStatus";

interface AtlasStatusViewProps {
  pathParameter: PathParameter;
}

export const AtlasStatusView = ({
  pathParameter,
}: AtlasStatusViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { atlasStatus } = useFetchAtlasStatus(pathParameter);
  // Status is the atlas landing page, so its back arrow returns to the
  // atlases list (honoring an explicit `from` origin when one is provided).
  const backPath = useBackPath(pathParameter) ?? getRouteURL(ROUTE.ATLASES);

  return (
    <ConditionalComponent isIn={Boolean(atlas && atlasStatus)}>
      <DetailView
        backPath={backPath}
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={atlasStatus && <StatusDashboard summary={atlasStatus} />}
        status={atlas && <AtlasStatuses statuses={atlas} />}
        tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
        title={atlas ? getAtlasName(atlas) : "View Status"}
      />
    </ConditionalComponent>
  );
};
