import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX } from "react";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { AtlasStatuses } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatuses/atlasStatuses";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useAtlasTabBackPath } from "../../hooks/useAtlasTabBackPath";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { VIEW_METADATA_CORRECTNESS_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs } from "./common/utils";
import { useFetchMetadataCorrectness } from "./hooks/useFetchMetadataCorrectness";

interface AtlasMetadataCorrectnessView {
  pathParameter: PathParameter;
}

export const AtlasMetadataCorrectnessView = ({
  pathParameter,
}: AtlasMetadataCorrectnessView): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { heatmap } = useFetchMetadataCorrectness(pathParameter);
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
