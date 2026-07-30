import { getAtlasName } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "@/app/common/entities";
import { Tabs } from "@/app/components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { ViewComponentAtlases } from "@/app/components/Detail/components/ViewComponentAtlases/viewComponentAtlases";
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
import { useFetchComponentAtlases } from "./hooks/UseFetchComponentAtlases/hook";
interface ComponentAtlasesViewProps {
  pathParameter: PathParameter;
}

export const ComponentAtlasesView = ({
  pathParameter,
}: ComponentAtlasesViewProps): JSX.Element => {
  const { data: atlas } = useFetchAtlas(pathParameter);
  const { data: componentAtlases } = useFetchComponentAtlases(pathParameter);
  const formManager = useFormManager();
  const backPath = useAtlasTabBackPath(pathParameter);
  return (
    <EntityProvider
      data={{ atlas, integratedObjects: componentAtlases }}
      formManager={formManager}
      pathParameter={pathParameter}
    >
      {/* Gated on atlas only: the table defaults its data to a stable [] and
      renders its own placeholder, so the chrome must not blank while the
      integrated objects (re)fetch — e.g. when the archived toggle changes the
      query key. Matches the previous hook, whose mapped list was always []. */}
      <ConditionalComponent isIn={Boolean(atlas)}>
        <StyledDetailView
          backPath={backPath}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={<ViewComponentAtlases />}
          status={atlas && <AtlasStatuses statuses={atlas} />}
          tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
          title={atlas ? getAtlasName(atlas) : "View Integrated Objects"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};
