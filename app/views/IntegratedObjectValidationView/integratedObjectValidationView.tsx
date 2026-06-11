import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment, JSX } from "react";
import { PathParameter } from "../../common/entities";
import { getRouteURL } from "../../common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { EntityView } from "../../components/Entity/components/EntityView/entityView";
import { useBackPath } from "../../components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/hook";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
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
  const { isLoading } = formManager;
  // Deep-link fallback: integrated-object detail (not URL-trim, which would
  // land on the validator-index route that server-redirects to "cap").
  const backPath =
    useBackPath(pathParameter) ??
    getRouteURL(ROUTE.COMPONENT_ATLAS, pathParameter);

  if (isLoading) return <Fragment />;

  return (
    <EntityProvider data={{ componentAtlas }} pathParameter={pathParameter}>
      <ConditionalComponent isIn={Boolean(atlas && componentAtlas)}>
        <DetailView
          backPath={backPath}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
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
