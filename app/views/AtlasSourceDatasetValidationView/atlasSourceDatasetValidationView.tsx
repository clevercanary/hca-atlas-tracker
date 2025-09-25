import { ConditionalComponent } from "@databiosphere/findable-ui/lib/components/ComponentCreator/components/ConditionalComponent/conditionalComponent";
import { Fragment } from "react";
import { getRouteURL } from "../../common/utils";
import { shouldRenderView } from "../../components/Detail/common/utils";
import { Breadcrumbs } from "../../components/Detail/components/TrackerForm/components/Breadcrumbs/breadcrumbs";
import { Tabs } from "../../components/Entity/components/common/Tabs/tabs";
import { DetailView } from "../../components/Layout/components/Detail/detailView";
import { useFetchAtlas } from "../../hooks/useFetchAtlas";
import { useFormManager } from "../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../routes/constants";
import { useFetchAtlasSourceDataset } from "../AtlasSourceDatasetView/hooks/useFetchAtlasSourceDataset";
import { getBreadcrumbs, getTabs } from "./common/utils";
import { Props } from "./entities";

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
    <ConditionalComponent
      isIn={shouldRenderView(canView, Boolean(atlas && sourceDataset))}
    >
      <DetailView
        backPath={getRouteURL(ROUTE.ATLAS_SOURCE_DATASET, pathParameter)}
        breadcrumbs={
          <Breadcrumbs breadcrumbs={getBreadcrumbs(pathParameter, atlas)} />
        }
        mainColumn={<div>Validation View {pathParameter.validation}</div>}
        tabs={<Tabs pathParameter={pathParameter} tabs={getTabs()} />}
        subTitle={sourceDataset?.publicationString}
        title={sourceDataset?.title || "Source Dataset Validations"}
      />
    </ConditionalComponent>
  );
};
