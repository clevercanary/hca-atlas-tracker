import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
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
import { useFetchComponentAtlas } from "../ComponentAtlasView/hooks/useFetchComponentAtlas";
import { VIEW_INTEGRATED_OBJECT_VALIDATION_SECTION_CONFIGS } from "./common/config";
import { getBreadcrumbs, getTabs } from "./common/utils";

interface Props {
  pathParameter: PathParameter;
}

export const IntegratedObjectValidationView = ({
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
    <EntityProvider data={{ componentAtlas }} pathParameter={pathParameter}>
      <ConditionalComponent
        isIn={shouldRenderView(canView, Boolean(atlas && componentAtlas))}
      >
        <DetailView
          backPath={getRouteURL(ROUTE.COMPONENT_ATLAS, pathParameter)}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
              accessFallback={renderAccessFallback(formManager)}
              sectionConfigs={VIEW_INTEGRATED_OBJECT_VALIDATION_SECTION_CONFIGS}
            />
          }
          tabs={
            <Tabs
              pathParameter={pathParameter}
              tabs={getTabs(componentAtlas)}
            />
          }
          title={componentAtlas?.title || "Integrated Object Validations"}
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
    return <AccessPrompt text="to view the integrated object validations" />;
  return null;
}
