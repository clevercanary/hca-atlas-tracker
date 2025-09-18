import { Breadcrumbs } from "@databiosphere/findable-ui/lib/components/common/Breadcrumbs/breadcrumbs";
import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { getAtlasName } from "../../apis/catalog/hca-atlas-tracker/common/utils";
import { PathParameter } from "../../common/entities";
import { AccessDeniedPrompt } from "../../components/common/Form/components/FormManager/components/AccessDeniedPrompt/accessDeniedPrompt";
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
  const {
    access: { canView },
    isLoading,
  } = formManager;
  const { atlas } = useFetchAtlas(pathParameter);
  const { atlasSourceDatasets } = useFetchAtlasSourceDatasets(pathParameter);

  if (isLoading) return <Fragment />;

  return (
    <EntityProvider
      data={{ atlas, atlasSourceDatasets }}
      pathParameter={pathParameter}
    >
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(atlas && atlasSourceDatasets))}
      >
        <DetailView
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              accessFallback={renderAccessFallback(formManager)}
              sectionConfigs={VIEW_ATLAS_SOURCE_DATASETS_SECTION_CONFIGS}
            />
          }
          status={atlas && <AtlasStatus atlasStatus={atlas.status} />}
          tabs={<Tabs atlas={atlas} pathParameter={pathParameter} />}
          title={atlas ? getAtlasName(atlas) : "View Source Datasets"}
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
    access: { canEdit, canView },
  } = formManager;
  if (!canView) return <AccessPrompt text="to view the source datasets" />;
  if (!canEdit) return <AccessDeniedPrompt />;
  return null;
}
