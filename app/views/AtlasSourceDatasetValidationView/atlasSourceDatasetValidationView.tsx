import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { JSX, Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { getRouteURL } from "../../common/utils";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { ROUTE } from "../../routes/constants";
import { useFetchAtlasSourceDataset } from "../AtlasSourceDatasetView/hooks/useFetchAtlasSourceDataset";
import { VIEW_SOURCE_DATASET_VALIDATION_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs, getTabs } from "./common/utils";

interface Props {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetValidationView = ({
  pathParameter,
}: Props): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { sourceDataset } = useFetchAtlasSourceDataset(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
    isLoading,
  } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <EntityProvider data={{ sourceDataset }} pathParameter={pathParameter}>
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(atlas && sourceDataset))}
      >
        <DetailView
          backPath={getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, pathParameter)}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              accessFallback={renderAccessFallback(formManager)}
              sectionConfigs={VIEW_SOURCE_DATASET_VALIDATION_SECTION_CONFIGS}
            />
          }
          tabs={<Tabs pathParameter={pathParameter} tabs={getTabs()} />}
          subTitle={sourceDataset?.publicationString}
          title={sourceDataset?.title || "Source Dataset Validations"}
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
  if (!canView)
    return <AccessPrompt text="to view the source dataset validations" />;
  return null;
}
