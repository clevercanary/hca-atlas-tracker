import { JSX } from "react";
import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Tabs } from "../../components/Detail/components/ViewAtlas/components/Tabs/tabs";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { AtlasStatus } from "../../components/Layout/components/Detail/components/DetailViewHero/components/AtlasStatus/atlasStatus";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
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
  const {
    access: { canView },
  } = formManager;
  return (
    <EntityProvider data={{ atlas, heatmap }} formManager={formManager}>
      <ConditionalComponent isIn={shouldRenderView(canView, Boolean(heatmap))}>
        <DetailView
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              accessFallback={renderAccessFallback(formManager)}
              sectionConfigs={VIEW_METADATA_CORRECTNESS_SECTION_CONFIGS}
            />
          }
          status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
          tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
          title={atlas ? getAtlasName(atlas) : "View Metadata Correctness"}
        />
      </ConditionalComponent>
    </EntityProvider>
  );
};

/**
 * Returns the access fallback component from the form manager access state.
 * @param formManager - Form manager.
 * @returns access fallback component.
 */
function renderAccessFallback(formManager: FormManager): JSX.Element | null {
  const {
    access: { canView },
  } = formManager;
  if (!canView) return <AccessPrompt text="to view the metadata correctness" />;
  return null;
}
