import { getAtlasName } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { type PathParameter } from "@/app/common/entities";
import { Tabs } from "@/app/components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { EntityView } from "@/app/components/Entity/components/EntityView/entityView";
import { AtlasStatuses } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { DetailView } from "@/app/components/Layout/components/Detail/detailView";
import { useAtlasTabBackPath } from "@/app/hooks/useAtlasTabBackPath";
import { useFetchAtlas } from "@/app/hooks/UseFetchAtlas/hook";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { EntityProvider } from "@/app/providers/entity/provider";
import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { type JSX } from "react";
import { VIEW_METADATA_CORRECTNESS_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs } from "./common/utils";
import { useFetchMetadataCorrectness } from "./hooks/UseFetchMetadataCorrectness/hook";

interface AtlasMetadataCorrectnessView {
  pathParameter: PathParameter;
}

export const AtlasMetadataCorrectnessView = ({
  pathParameter,
}: AtlasMetadataCorrectnessView): JSX.Element => {
  const { data: atlas } = useFetchAtlas(pathParameter);
  const { data: heatmap } = useFetchMetadataCorrectness(pathParameter);
  const formManager = useFormManager();
  const backPath = useAtlasTabBackPath(pathParameter);
  return (
    <EntityProvider data={{ atlas, heatmap }} formManager={formManager}>
      <ConditionalComponent isIn={Boolean(heatmap)}>
        <DetailView
          backPath={backPath}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              sectionConfigs={VIEW_METADATA_CORRECTNESS_SECTION_CONFIGS}
            />
          }
          status={atlas && <AtlasStatuses statuses={atlas} />}
          tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
          title={atlas ? getAtlasName(atlas) : "View Metadata Correctness"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};
