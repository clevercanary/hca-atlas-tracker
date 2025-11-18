import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { PathParameter } from "../../common/entities";
import { AccessPrompt } from "../../components/common/Form/components/FormManager/components/AccessPrompt/accessPrompt";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { FormManager } from "../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { EntityProvider } from "../../providers/entity/provider";
import { getTabs } from "../ComponentAtlasView/common/utils";
import { useFetchComponentAtlas } from "../ComponentAtlasView/hooks/useFetchComponentAtlas";
import { getBreadcrumbs } from "./common/utils";

interface Props {
  pathParameter: PathParameter;
}

export const IntegratedObjectSourceDatasetsView = ({
  pathParameter,
}: Props): JSX.Element => {
  const { atlas } = useFetchAtlas(pathParameter);
  const { componentAtlas } = useFetchComponentAtlas(pathParameter);
  const formManager = useFormManager();
  const {
    access: { canView },
    isLoading,
  } = formManager;
  if (isLoading) return <Fragment />;
  return (
    <EntityProvider pathParameter={pathParameter}>
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(atlas && componentAtlas))}
      >
        <DetailView
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            renderAccessFallback(formManager) ? (
              renderAccessFallback(formManager)
            ) : (
              <div>Integrated Object Source Datasets</div>
            )
          }
          tabs={<Tabs pathParameter={pathParameter} tabs={getTabs()} />}
          title={componentAtlas?.title || "Integrated Object Source Datasets"}
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
    return (
      <AccessPrompt text="to view the integrated object source datasets" />
    );
  return null;
}
