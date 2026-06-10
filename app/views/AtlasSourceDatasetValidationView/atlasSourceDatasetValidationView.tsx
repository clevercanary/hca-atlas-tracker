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
  const { isLoading } = formManager;
  // Deep-link fallback: source-dataset detail (not URL-trim, which would
  // land on the validator-index route that server-redirects to "cap").
  const backPath =
    useBackPath(pathParameter) ??
    getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, pathParameter);

  if (isLoading) return <Fragment />;

  return (
    <EntityProvider data={{ sourceDataset }} pathParameter={pathParameter}>
      <ConditionalComponent isIn={Boolean(atlas && sourceDataset)}>
        <DetailView
          backPath={backPath}
          breadcrumbs={
            <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
          }
          mainColumn={
            <EntityView
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
