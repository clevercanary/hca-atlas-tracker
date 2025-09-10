import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { AccessDeniedPrompt } from "../../components/common/Form/components/FormManager/components/AccessDeniedPrompt/accessDeniedPrompt";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Divider } from "../../components/Detail/components/TrackerForm/components/Divider/divider.styles";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS } from "./common/sections";
import { getBreadcrumbs } from "./common/utils";
import { ViewAtlasSourceDataset } from "./components/ViewAtlasSourceDataset/viewAtlasSourceDataset";
import { useEditAtlasSourceDatasetForm } from "./hooks/useEditAtlasSourceDatasetForm";

interface AtlasSourceDatasetViewProps {
  pathParameter: PathParameter;
}

export const AtlasSourceDatasetView = ({
  pathParameter,
}: AtlasSourceDatasetViewProps): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const formMethod = useEditAtlasSourceDatasetForm(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
    isLoading,
  } = formManager;
  const { data: sourceDataset } = formMethod;
  if (isLoading) return <Fragment />;
  const accessFallback = renderAccessFallback(formManager);
  return (
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceDataset))}
    >
      <DetailView
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={
          <ViewAtlasSourceDataset
            accessFallback={accessFallback}
            formManager={formManager}
            formMethod={formMethod}
            sectionConfigs={VIEW_ATLAS_SOURCE_DATASET_SECTION_CONFIGS}
          />
        }
        subTitle={sourceDataset?.publicationString}
        title={sourceDataset?.title || "Source Dataset"}
      />
    </ConditionalComponent>
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
  if (!canView)
    return (
      <AccessPrompt divider={<Divider />} text="to view the source dataset" />
    );
  if (!canEdit) return <AccessDeniedPrompt divider={<Divider />} />;
  return null;
}
